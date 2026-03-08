const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder().setName('rob').setDescription('Roba a alguien')
        .addUserOption(o => o.setName('user').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const target = interaction.options.getUser('user');
        const data = await getUserData(userId);
        const targetData = await getUserData(target.id);
        const tier = data.premiumType || 'normal';

        if (target.id === userId) return interaction.reply("❌");

        const now = Date.now();
        const baseCD = 30 * 60 * 1000; // 30m
        let cd = tier === 'bimestral' ? 0 : (tier === 'mensual' ? baseCD / 2 : baseCD);

        if (cd > 0 && now - (data.lastRob || 0) < cd) return interaction.reply("⏳");

        data.lastRob = now;
        if (Math.random() > 0.6 && targetData.wallet > 100) {
            const rob = Math.floor(targetData.wallet * 0.1);
            data.wallet += rob;
            targetData.wallet -= rob;
            await updateUserData(userId, data);
            await updateUserData(target.id, targetData);
            return interaction.reply(`🔫 Robaste **${rob} 🌸**.`);
        } else {
            return interaction.reply("👢 Fallaste el robo.");
        }
    }
};