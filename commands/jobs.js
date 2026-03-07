const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js'); // Ajusta la ruta si es necesario
const fs = require('fs');
const path = require('path');

const ICONS = {
    work: '💼',
    money: '🌸',
    error: '❌',
};

const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

const getJobs = () => {
    const p = path.join(__dirname, '../../data/jobs.json'); // Ajusta la ruta si es necesario
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('Muestra la lista de trabajos disponibles.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const data = getUserData(userId);
        const jobs = getJobs();

        let description = '';
        for (const jobId in jobs) {
            const job = jobs[jobId];
            description += `**${job.name}** - ${job.description}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.work} Trabajos Disponibles`)
            .setDescription(description || 'No hay trabajos disponibles.')
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    },
};