const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'mine',
    description: 'Extrae flores de las profundidades de la tierra ⛏️',
    category: 'economía',
    async execute(input) {
        const user = input.author || input.user;
        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // --- 📂 1. VERIFICACIÓN DE HERRAMIENTAS (¡PRIMERO!) ---
        const zonas = [
            { id: 'pico_mitico', zona: 'Abismo Eterno', multis: 4 },
            { id: 'pico_hierro', zona: 'Venas de Acero', multis: 1.8 },
            { id: 'pico_madera', zona: 'Gruta Superficial', multis: 1 }
        ];
        
        // Zona VIP exclusiva
        if (data.premiumType === 'pro' || data.premiumType === 'ultra') {
            zonas.unshift({ id: 'pico_void', zona: '✨ Void Haven', multis: 6, secret: true });
        }

        // Buscamos si tiene el pico normal o el reparado en su Objeto de inventario
        const mejorPico = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorPico) {
            return input.reply({ content: "╰┈➤ ❌ No puedes entrar a la mina sin herramientas. Ve a la `!!shop` por un pico.", ephemeral: true });
        }

        // --- ⚙️ 2. CONFIGURACIÓN DE RANGOS Y COOLDOWN ---
        if (data.health === undefined) data.health = 3;
        let riesgo = 0.15, daño = 1, pctPerdida = 0.15, pctVidas = 0.60, cooldown = 300000;

        if (data.premiumType === 'pro' || data.premiumType === 'mensual') { 
            riesgo = 0.10; daño = 0.5; pctPerdida = 0.10; pctVidas = 0.50; cooldown = 120000; 
        } else if (data.premiumType === 'ultra' || data.premiumType === 'bimestral') { 
            riesgo = 0.05; daño = 0.3; pctPerdida = 0.05; pctVidas = 0.20; cooldown = 0; 
        }

        const lastMine = data.lastMine ? new Date(data.lastMine).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastMine < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastMine)) / 1000);
            return input.reply({ content: `⏳ El polvo no se ha asentado. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        // --- 💀 3. LÓGICA DE RIESGO (DERRUMBE) ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            data.lastMine = Date.now(); // El intento fallido también consume cooldown

            if (data.health <= 0) {
                const perdidaDinero = Math.floor((data.wallet || 0) * pctPerdida);
                const vidasPerdidasInv = Math.ceil((inv['vidas'] || 0) * pctVidas);
                
                data.wallet = Math.max(0, (data.wallet || 0) - perdidaDinero);
                data.health = 0; // Se queda en 0 para que el hospital lo cure
                
                if (inv['vidas']) data.inventory['vidas'] -= vidasPerdidasInv;

                // Pérdida de materiales (Sincronizado con Objeto)
                const mats = ['wood', 'stone', 'iron_ore'];
                mats.forEach(m => { 
                    if(inv[m]) data.inventory[m] = Math.max(0, inv[m] - Math.ceil(inv[m] * pctPerdida)); 
                });

                await updateUserData(user.id, data);
                
                const deathEmbed = new EmbedBuilder()
                    .setTitle('💀 Muerte en la Mina')
                    .setColor('#000000')
                    .setDescription(`Has sucumbido ante la presión de la tierra.\n\n> 💸 Perdiste: \`${perdidaDinero}\` flores\n> 💔 Vidas perdidas: \`${vidasPerdidasInv}\``)
                    .setFooter({ text: 'Usa !!hospital para recuperarte' });

                return input.reply({ embeds: [deathEmbed] });
            }

            await updateUserData(user.id, data);
            return input.reply(`⚠️ **Derrumbe:** Recibiste una herida de \`${daño}\`. ❤️ Vitalidad: \`${data.health.toFixed(1)}/3\``);
        }

        // --- 💰 4. CÁLCULO DE GANANCIAS ---
        const flores = Math.floor(Math.random() * 500 + 500) * mejorPico.multis;
        data.wallet = (data.wallet || 0) + flores;
        data.lastMine = Date.now();

        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Exploración: ${mejorPico.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorPico.secret ? 'https://i.pinimg.com/originals/7b/0a/61/7b0a61833503b414f6b0f1a91e3e7f91.gif' : 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif')
            .setDescription(`> *“El silencio de la piedra es tu único aliado.”*\n\n💰 **Ganancia:** \`${flores.toFixed(0)}\` flores\n❤️ **Vitalidad:** \`${data.health.toFixed(1)}/3\``)
            .setFooter({ text: `Herramienta: ${mejorPico.id.replace(/_/g, ' ')}` });

        return input.reply({ embeds: [embed] });
    }
};
