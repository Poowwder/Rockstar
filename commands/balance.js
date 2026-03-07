const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js'); // Ajusta la ruta si es necesario

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu balance de R☆coins.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const data = getUserData(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Balance de ${user.username}`)
            .setDescription(`Wallet: ${data.wallet} R☆coins\nBank: ${data.bank} R☆coins`)
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};