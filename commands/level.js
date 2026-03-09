const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); // Ajusta la ruta si es necesario

const ICONS = {
    level: '🌟',
    exp: '✨',
};

const COLORS = {
    primary: '#FFB6C1',
};

const calculateLevel = (exp) => {
    // Esta es una función simple de ejemplo. Puedes ajustarla según tus necesidades.
    return Math.floor(Math.sqrt(exp) / 10);
};

const calculateExperienceForNextLevel = (level) => {
    // Esta es una función simple de ejemplo. Puedes ajustarla según tus necesidades.
    return Math.pow(level * 10, 2);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Muestra tu nivel y experiencia.'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const data = getUserData(userId);
        let { experience } = data;

        const level = calculateLevel(experience);
        const expForNextLevel = calculateExperienceForNextLevel(level + 1);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.level} Nivel de ${user.username}`)
            .setDescription(`Nivel: ${level}\nExperiencia: ${experience} / ${expForNextLevel} ${ICONS.exp}`)
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    },
};