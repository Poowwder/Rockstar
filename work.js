const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../../economyManager.js'); // Ajusta la ruta si es necesario
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
        .setName('work')
        .setDescription('Trabaja y gana R☆coins.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const cooldown = checkAndSetCooldown(userId, 'work', 3600); // 1 hora
        if (cooldown > 0) {
            return interaction.reply(`Debes esperar ${cooldown} segundos para volver a trabajar.`);
        }

        const data = getUserData(userId);
        const jobs = getJobs();

        if (!data.job || data.job === 'unemployed') {
            return interaction.reply('No tienes un trabajo. Usa `!!jobs` para ver los trabajos disponibles.');
        }

        const job = jobs[data.job];
        if (!job) {
            data.job = 'unemployed';
            updateUserData(userId, data);
            return interaction.reply('Tu trabajo actual no es válido. Busca un nuevo trabajo.');
        }

        let salary = job.baseSalary;
        let eventText = '';

        // Eventos aleatorios
        if (job.events && job.events.length > 0) {
            const rand = Math.random() * 100;
            let cumulative = 0;

            for (const event of job.events) {
                cumulative += event.chance;
                if (rand < cumulative) {
                    if (event.type === 'positive') {
                        salary += event.bonus || 0;
                        eventText = `\n\n${ICONS.work} ${event.text} (+${event.bonus} R☆coins)`;
                    } else if (event.type === 'negative') {
                        salary -= event.penalty || 0;
                        eventText = `\n\n${ICONS.error} ${event.text} (-${event.penalty} R☆coins)`;
                    }
                    break;
                }
            }
        }

        data.wallet += salary;
        updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.work} Trabajando como ${job.name}`)
            .setDescription(`Has trabajado y ganado ${salary} R☆coins.${eventText}`)
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    },
};