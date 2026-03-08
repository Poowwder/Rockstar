const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder().setName('work').setDescription('Trabaja para ganar flores'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const tier = data.premiumType || 'normal';

        const now = Date.now();
        const baseCD = 60 * 60 * 1000; // 1 hora
        let cd = tier === 'bimestral' ? 0 : (tier === 'mensual' ? baseCD / 2 : baseCD);

        if (cd > 0 && now - (data.lastWork || 0) < cd) {
            return interaction.reply(`⏳ Vuelve en **${Math.ceil((cd - (now - data.lastWork)) / 60000)}m**.`);
        }

        const paga = Math.floor(Math.random() * 200) + 150;
        data.wallet += paga;
        data.lastWork = now;

        await updateUserData(userId, data);
        await addXP(userId, 20, interaction, { getUserData, updateUserData }); // 20 base * mult

        return interaction.reply(`💼 Trabajaste y ganaste **${paga} 🌸**.`);
    }
};