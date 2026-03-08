const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder().setName('fish').setDescription('Pesca peces'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const tier = data.premiumType || 'normal';

        const now = Date.now();
        const baseCD = 5 * 60 * 1000;
        let cd = tier === 'bimestral' ? 0 : (tier === 'mensual' ? 2 * 60 * 1000 : baseCD);

        if (cd > 0 && now - (data.lastFish || 0) < cd) return interaction.reply("⏳ Cooldown activo.");
        if (!data.equippedRod) return interaction.reply("❌ No tienes caña.");

        const pescado = Math.random() > 0.8 ? 'rare_fish' : 'common_fish';
        data.inventory[pescado] = (data.inventory[pescado] || 0) + 1;
        data.lastFish = now;

        await updateUserData(userId, data);
        await addXP(userId, 10, interaction, { getUserData, updateUserData });

        return interaction.reply(`🎣 Pescaste un **${pescado}**.`);
    }
};