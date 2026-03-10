const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'crime',
    data: new SlashCommandBuilder().setName('rob').setDescription('🕶️ Crimen Rockstar'),
    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);
        if (data.health <= 0) return input.reply("💀 En el hospital no se puede delinquir.");

        let cooldown = 300000, prob = 0.45, vidasP = 2;
        if (data.premiumType === 'mensual') { cooldown = 120000; prob = 0.60; vidasP = 1; }
        if (data.premiumType === 'bimestral') { cooldown = 0; prob = 0.80; vidasP = 0.5; }

        if (cooldown > 0 && Date.now() - (data.lastCrime || 0) < cooldown) return input.reply("⏳ La poli vigila...");

        if (Math.random() > prob) {
            data.health -= vidasP;
            // Multa fija si no mueres
            if (data.health > 0) data.wallet = Math.max(0, data.wallet - 1200);
            await updateUserData(user.id, data);
            return input.reply(`🚫 ¡Fallaste! Perdiste ${vidasP} vidas.`);
        }

        let gana = Math.floor(Math.random() * 3000 + 2000);
        data.wallet += gana;
        data.lastCrime = Date.now();
        await updateUserData(user.id, data);
        input.reply(`🕶️ ¡Crimen perfecto! Ganaste **${gana}** flores.`);
    }
};