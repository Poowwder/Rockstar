const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('node:path');
const ms = require('ms');

const lootBoxesDataPath = path.join(__dirname, '../../lootboxes.json');
const ICONS = {
    loot: '🎁',
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

const getLootBoxes = () => {
    const p = path.join(__dirname, '..', '..', 'lootboxes.json');
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
        .setName('lootbox')
        .setDescription('Gestiona tus cajas de botín.')
        .addSubcommand(sub => sub.setName('open').setDescription('Abre una caja de botín.').addStringOption(o => o.setName('id').setDescription('ID de la caja a abrir.').setRequired(true))),
    category: 'currency',
    description: 'Abre cajas de botín.',
    usage: '!!lootbox <open>',
    aliases: ['lootboxes', 'caja', 'cajas'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/lootbox` para las cajas de botín.');
    },
    async executeSlash(interaction) {
        const { options, user } = interaction;
        const sub = interaction.options.getSubcommand();

        if (sub === 'open') {
            const lootboxId = options.getString('id');
            const data = getUserData(user.id);
            const lootboxes = getLootBoxes();

            const lootboxToOpen = lootboxes[lootboxId];
            if (!lootboxToOpen) return interaction.reply(`${ICONS.error} Caja de botín no encontrada.`);

            if (!data.inventory.some(item => item.id === lootboxId)) return interaction.reply(`${ICONS.error} No tienes esa caja de botín en tu inventario.`);

            // Implementar lógica de abrir la caja de botín y dar recompensas aquí
            // (Aún no implementado, pero aquí iría el código)

            await interaction.reply(`🎁 Abriste una **${lootboxToOpen.name}**. Recibiste: ...¡sorpresa!`);
        }
    },
};