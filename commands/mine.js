const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'mine',
    data: new SlashCommandBuilder().setName('mine').setDescription('⛏️ Minería Rockstar'),
    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);

        if (data.health <= 0) return input.reply("💀 Estás muerta. Compra vidas en la tienda.");

        let cooldown = 300000, riesgo = 0.15, multa = 0.10, vidasP = 2, boost = 1;

        if (data.premiumType === 'mensual') { 
            cooldown = 120000; riesgo = 0.10; multa = 0.05; vidasP = 1; boost = 5; 
        } else if (data.premiumType === 'bimestral') { 
            cooldown = 0; riesgo = 0.05; multa = 0; vidasP = 0.5; boost = 8; 
        }

        if (cooldown > 0 && Date.now() - (data.lastMine || 0) < cooldown) return input.reply("⏳ Espera un poco, reina.");

        if (Math.random() < riesgo) {
            data.health -= vidasP;
            const perdida = Math.floor(data.wallet * multa);
            data.wallet -= perdida;
            await updateUserData(user.id, data);
            return input.reply({ embeds: [new EmbedBuilder().setTitle('💥 ¡Derrumbe!').setColor('#FF0000').setDescription(`Perdiste ${vidasP} vidas y ${perdida} flores.`)] });
        }

        let gana = Math.floor(Math.random() * 500 + 600) * boost;
        data.wallet += gana;
        data.lastMine = Date.now();
        await updateUserData(user.id, data);
        input.reply(`⛏️ ¡Minaste **${gana}** flores! ❤️ Vidas: ${data.health.toFixed(1)}`);
    }
};