const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');

const eventsDataPath = path.join(__dirname, '../../events.json');
const ICONS = {
    boost: '🚀',
    money: '🌸',
    error: '❌',
    event: '🎉',
};
const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const getEvents = () => {
    const p = path.join(__dirname, '..', '..', 'events.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

async function createEconomyEmbed(ctx, title, description, color, thumbnailType = 'default') {
    const guildName = ctx.guild ? ctx.guild.name : 'R☆ckstar';
    const guildIcon = ctx.guild ? ctx.guild.iconURL() : null;
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(THUMBNAILS[thumbnailType] || THUMBNAILS.default)
        .setFooter({ text: guildName, iconURL: guildIcon })
        .setTimestamp();
    return embed;
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Gestiona eventos globales.')
        .addSubcommand(sub => sub.setName('start').setDescription('Inicia un evento.').addStringOption(o => o.setName('id').setDescription('ID del evento').setRequired(true))),
    category: 'currency',
    description: 'Activa eventos globales.',
    usage: '!!event <start>',
    aliases: ['evento'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/event` para los eventos.');
    },
    async executeSlash(interaction) {
        const { options, user } = interaction;
        const sub = interaction.options.getSubcommand();

        if (sub === 'start') {
            const eventId = options.getString('id');
            const events = getEvents();

            const eventToStart = events[eventId];
            if (!eventToStart) return interaction.reply(`${ICONS.error} Evento no encontrado.`);

            // Implementar lógica de inicio del evento aquí
            // (Aún no implementado, pero aquí iría el código)

            await interaction.reply(`✅ Evento **${eventToStart.name}** iniciado.`);
        }
    },
};