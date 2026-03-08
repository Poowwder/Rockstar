const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria de flores y una caja'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;
        const lastDaily = data.lastDailyClaim || 0;

        if (now - lastDaily < cooldown) {
            const timeLeft = cooldown - (now - lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            return interaction.reply(`⏳ Ya has reclamado tu recompensa. Vuelve en **${hours}h ${minutes}m**.`);
        }

        // Recompensas
        const flowers = 500;
        const xpGain = 100;
        
        data.wallet += flowers;
        data.lastDailyClaim = now;
        
        // Añadir una caja al inventario (asegúrate de que el ID "daily_box" existe en tu shop.json)
        if (!data.inventory) data.inventory = {};
        data.inventory['daily_box'] = (data.inventory['daily_box'] || 0) + 1;

        await updateUserData(userId, data);
        await addXP(userId, xpGain, interaction, { getUserData, updateUserData });

        const embed = new EmbedBuilder()
            .setTitle('🎁 Recompensa Diaria')
            .setDescription(`¡Has recibido tus beneficios del día!\n\n🌸 **+${flowers} Flores**\n✨ **+${xpGain} XP**\n📦 **1x Caja Diaria**`)
            .setColor('#FFB6C1')
            .setFooter({ text: 'Vuelve mañana para más' });

        return interaction.reply({ embeds: [embed] });
    }
};