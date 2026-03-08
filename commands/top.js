const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Muestra el ranking de los niveles más altos'),

    async execute(interaction) {
        const allUsers = await getAllData();

        // Ordenar por nivel (descendente) y luego por XP
        const sorted = allUsers.sort((a, b) => {
            if (b.level !== a.level) return (b.level || 1) - (a.level || 1);
            return (b.xp || 0) - (a.xp || 0);
        }).slice(0, 10); // Top 10

        let description = "";
        sorted.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            description += `${medal} **#${index + 1}** <@${user.userId}>\n╰ Nivel: \`${user.level || 1}\` | XP: \`${user.xp || 0}\`\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🏆 Ranking de Niveles - Top 10')
            .setDescription(description || "Aún no hay datos de usuarios.")
            .setColor('#f1c40f')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};