const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'fish',
    description: 'Prueba tu suerte en las aguas de las sombras 🎣',
    category: 'economía',
    async execute(input) {
        const user = input.author || input.user;
        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // --- 🎣 1. VERIFICACIÓN DE HERRAMIENTAS (¡PRIMERO!) ---
        const zonas = [
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 4 },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1 }
        ];
        
        // Zona VIP exclusiva
        if (data.premiumType === 'pro' || data.premiumType === 'ultra' || data.premiumType === 'mensual' || data.premiumType === 'bimestral') {
            zonas.unshift({ id: 'cana_void', zona: '✨ Abyss of Stars', multis: 6, secret: true });
        }

        // Buscamos si tiene la caña en el objeto de inventario
        const mejorCana = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorCana) {
            return input.reply({ content: "╰┈➤ ❌ No puedes pescar con las manos. Compra una caña en la `!!shop`.", ephemeral: true });
        }

        // --- ⚙️ 2. CONFIGURACIÓN DE RANGOS Y COOLDOWN ---
        if (data.health === undefined) data.health = 3;
        let riesgo = 0.15, daño = 1, pctPerdida = 0.15, pctVidas = 0.60, cooldown = 300000;

        const premium = (data.premiumType || 'none').toLowerCase();
        if (premium === 'pro' || premium === 'mensual') { 
            riesgo = 0.10; daño = 0.5; pctPerdida = 0.10; pctVidas = 0.50; cooldown = 120000; 
        } else if (premium === 'ultra' || premium === 'bimestral') { 
            riesgo = 0.05; daño = 0.3; pctPerdida = 0.05; pctVidas = 0.20; cooldown = 0; 
        }

        const lastFish = data.lastFish ? new Date(data.lastFish).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastFish < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastFish)) / 1000);
            return input.reply({ content: `⏳ El agua está muy agitada. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        // --- 💀 3. LÓGICA DE RIESGO (NAUFRAGIO) ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            data.lastFish = Date.now();

            if (data.health <= 0) {
                const perdidaDinero = Math.floor((data.wallet || 0) * pctPerdida);
                const vidasPerdidasInv = Math.ceil((inv['vidas'] || 0) * pctVidas);
                
                data.wallet = Math.max(0, (data.wallet || 0) - perdidaDinero);
                data.health = 0; // Se queda en 0 para el hospital
                
                if (inv['vidas']) data.inventory['vidas'] -= vidasPerdidasInv;

                // Pérdida de peces (Sincronizado con Objeto)
                if(inv['fish']) data.inventory['fish'] = Math.max(0, inv['fish'] - Math.ceil(inv['fish'] * pctPerdida));

                await updateUserData(user.id, data);
                
                const deathEmbed = new EmbedBuilder()
                    .setTitle('💀 Naufragio Fatal')
                    .setColor('#000000')
                    .setDescription(`Te has hundido en las profundidades.\n\n> 💸 Perdiste: \`${perdidaDinero}\` flores\n> 💔 Vidas perdidas: \`${vidasPerdidasInv}\``)
                    .setFooter({ text: 'Usa !!hospital para volver a la vida' });

                return input.reply({ embeds: [deathEmbed] });
            }

            await updateUserData(user.id, data);
            return input.reply(`🌊 **Ola Gigante:** Casi te arrastra el mar. Perdiste \`${daño}\` vida. ❤️ Vitalidad: \`${data.health.toFixed(1)}/3\``);
        }

        // --- 💰 4. CÁLCULO DE CAPTURA ---
        const flores = Math.floor(Math.random() * 500 + 500) * mejorCana.multis;
        data.wallet = (data.wallet || 0) + flores;
        data.lastFish = Date.now();

        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Pesca: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif')
            .setDescription(`> *“En el reflejo del agua, la paciencia es poder.”*\n\n💰 **Ganancia:** \`${flores.toFixed(0)}\` flores\n❤️ **Vitalidad:** \`${data.health.toFixed(1)}/3\``)
            .setFooter({ text: `Equipo: ${mejorCana.id.replace(/_/g, ' ')}` });

        return input.reply({ embeds: [embed] });
    }
};
