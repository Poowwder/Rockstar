const { SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

const boostsDataPath = path.join(__dirname, '../../boosts.json');
const ICONS = {
    boost: '🚀',
    money: '🌸',
    error: '❌',
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

const getBoosts = () => {
    const p = path.join(__dirname, '..', '..', 'boosts.json');
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
        .setName('boost')
        .setDescription('Gestiona tus bonificaciones temporales.')
        .addSubcommand(sub => sub.setName('activate').setDescription('Activa una bonificación.').addStringOption(o => o.setName('id').setDescription('ID de la bonificación').setRequired(true))),
    category: 'currency',
    description: 'Activa bonificaciones temporales.',
    usage: '!!boost <activate>',
    aliases: ['bonificaciones'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/boost` para las bonificaciones.');
    },
    async executeSlash(interaction) {
        const { options, user } = interaction;
        const sub = interaction.options.getSubcommand();

        if (sub === 'activate') {
            const boostId = options.getString('id');
            const data = getUserData(user.id);
            const boosts = getBoosts();

            const boostToActivate = boosts[boostId];
            if (!boostToActivate) return interaction.reply(`${ICONS.error} Bonificación no encontrada.`);

            if (!data.inventory.some(item => item.id === boostId)) return interaction.reply(`${ICONS.error} No tienes esa bonificación en tu inventario.`);

            // Implementar lógica de activación y efectos de la bonificación aquí
            // (Aún no implementado, pero aquí iría el código)
            const tiempo = ms(boostToActivate.duration * 1000, { long: true });
            await interaction.reply(`✅ Bonificación **${boostToActivate.name}** activada. Duración: ${tiempo}.`);
        }
    },
};