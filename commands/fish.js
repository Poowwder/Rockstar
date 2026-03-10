const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'fish',
    async execute(input) {
        const user = input.author || input.user;
        let data = await getUserData(user.id);

        if (data.health === undefined) data.health = 3;
        let riesgo = 0.15, daño = 1, pctPerdida = 0.15, pctVidas = 0.60, cooldown = 300000;

        if (data.premiumType === 'pro') { 
            riesgo = 0.10; daño = 0.5; pctPerdida = 0.10; pctVidas = 0.50; cooldown = 120000; 
        } else if (data.premiumType === 'ultra') { 
            riesgo = 0.05; daño = 0.3; pctPerdida = 0.05; pctVidas = 0.20; cooldown = 0; 
        }

        const pasado = Date.now() - (data.lastFish || 0);
        if (cooldown > 0 && pasado < cooldown) return input.reply(`⏳ Espera \`${Math.ceil((cooldown - pasado)/1000)}s\`.`);

        // --- 🌊 LÓGICA DE MUERTE ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            if (data.health <= 0) {
                const perdidaDinero = Math.floor((data.wallet || 0) * pctPerdida);
                const vidasInv = Math.ceil((data.inventory?.['vidas'] || 0) * pctVidas);
                
                data.wallet -= perdidaDinero;
                data.health = 3;
                if (data.inventory?.['vidas']) data.inventory['vidas'] -= vidasInv;
                
                // Pérdida de peces
                if(data.inventory?.['fish']) data.inventory['fish'] -= Math.ceil(data.inventory['fish'] * pctPerdida);

                await updateUserData(user.id, data);
                return input.reply({ embeds: [new EmbedBuilder().setTitle('💀 Naufragio Fatal').setColor('#1a1a1a').setDescription(`Te has ahogado. Perdiste \`${perdidaDinero}\` flores y \`${vidasInv}\` vidas del inventario.`)] });
            }
            await updateUserData(user.id, { health: data.health, lastFish: Date.now() });
            return input.reply(`🌊 **Ola Gigante:** Perdiste \`${daño}\` vida. ❤️: \`${data.health.toFixed(1)}/3\``);
        }

        // --- 📂 ZONAS DE PESCA ---
        const inv = data.inventory || {};
        const zonas = [
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 4 },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1 }
        ];
        if (data.premiumType === 'pro' || data.premiumType === 'ultra') zonas.unshift({ id: 'cana_divina', zona: '✨ Abyss of Stars', multis: 6, secret: true });

        const mejorCana = zonas.find(z => inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0);
        if (!mejorCana) return input.reply("No tienes caña.");

        let flores = Math.floor(Math.random() * 500 + 500) * mejorCana.multis;
        data.wallet = (data.wallet || 0) + flores;
        data.lastFish = Date.now();

        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Pesca: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif')
            .setDescription(`> *“En el reflejo del agua, la paciencia es poder.”*\n\n💰 **Ganancia:** \`${flores.toFixed(0)}\` flores\n❤️ **Vitalidad:** \`${data.health.toFixed(1)}/3\``);

        return input.reply({ embeds: [embed] });
    }
};
