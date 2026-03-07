const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../economyManager.js'); // Ajusta la ruta si es necesario

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const cooldown = checkAndSetCooldown(userId, 'daily', 86400); // 24 horas
        if (cooldown > 0) {
            return interaction.reply(`Debes esperar ${cooldown} segundos para volver a reclamar tu recompensa diaria.`);
        }

        const data = getUserData(userId);
        const reward = 500; // Recompensa diaria

        data.wallet += reward;
        updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`Recompensa Diaria`)
            .setDescription(`Has reclamado tu recompensa diaria de ${reward} R☆coins.`)
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};