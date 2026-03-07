const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../../economyManager.js'); // Ajusta la ruta si es necesario

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Reclama tu recompensa semanal.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const cooldown = checkAndSetCooldown(userId, 'weekly', 604800); // 7 días
        if (cooldown > 0) {
            return interaction.reply(`Debes esperar ${cooldown} segundos para volver a reclamar tu recompensa semanal.`);
        }

        const data = getUserData(userId);
        const reward = 3500; // Recompensa semanal

        data.wallet += reward;
        updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`Recompensa Semanal`)
            .setDescription(`Has reclamado tu recompensa semanal de ${reward} R☆coins.`)
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};