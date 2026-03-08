const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder().setName('crime').setDescription('Comete un crimen'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const tier = data.premiumType || 'normal';

        const now = Date.now();
        const baseCD = 4 * 60 * 60 * 1000; // 4h
        let cd = tier === 'bimestral' ? 0 : (tier === 'mensual' ? baseCD / 2 : baseCD);

        if (cd > 0 && now - (data.lastCrime || 0) < cd) return interaction.reply("🚓 La policía vigila.");

        const success = Math.random() > 0.5;
        data.lastCrime = now;

        if (success) {
            const gain = 800;
            data.wallet += gain;
            await updateUserData(userId, data);
            await addXP(userId, 40, interaction, { getUserData, updateUserData });
            return interaction.reply(`🥷 Ganaste **${gain} 🌸**.`);
        } else {
            data.wallet = Math.max(0, data.wallet - 400);
            await updateUserData(userId, data);
            return interaction.reply("🚨 Te atraparon. Multa de 400 🌸.");
        }
    }
};