const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory, getAuctions, createAuction, placeBid } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const auctionsDataPath = path.join(__dirname, '..', 'auctions.json');
const ICONS = {
    money: '🌸',
	error: '❌',
    auction: '💰'
}
const COLORS = {
    primary: '#FFB6C1',
	error: '#FF6961'
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

const getShopItems = () => {
    const p = path.join(__dirname, '..', '..', 'shop.json');
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
        .setName('auction')
        .setDescription('Sistema de subastas.')
        .addSubcommand(sub => sub.setName('create').setDescription('Crea una subasta.').addStringOption(o => o.setName('item').setDescription('ID del item').setRequired(true)).addIntegerOption(o => o.setName('precio').setDescription('Precio inicial').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setDescription('Ver subastas activas.'))
        .addSubcommand(sub => sub.setName('bid').setDescription('Pujar en una subasta.').addStringOption(o => o.setName('id').setDescription('ID de la subasta').setRequired(true)).addIntegerOption(o => o.setName('monto').setDescription('Cantidad a pujar').setRequired(true))),
    category: 'currency',
    description: 'Subasta items.',
    usage: '!!auction <create|list|bid>',
    aliases: ['auctions'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/auction` para las subastas.');
	},
    async executeSlash(interaction) {
        const {options, user, guild} = interaction;
        const sub = interaction.options.getSubcommand();
        
        if (sub === 'create') {
            const item = options.getString('item');
            const price = options.getInteger('precio');

            if (!removeItemFromInventory(user.id, item, 1)) {
                return interaction.reply(`${ICONS.error} No tienes ese ítem en el inventario.`);
            }

            const id = createAuction({ seller: user.id, guildId: guild.id, item, startPrice: price, currentPrice: price, endTime: Date.now() + 86400000 });
            return interaction.reply(`✅ Subasta creada con ID: \`${id}\`.`);
        }

        if (sub === 'list') {
            const auctions = getAuctions();
            const activeAuctions = Object.values(auctions).filter(auction => auction.guildId === guild.id);
            const list = activeAuctions.map(auction => {
                const item = getShopItems()[auction.item];
                return `**ID:** \`${auction.id}\` | **Item:** ${item?.icon || ''} ${item?.name || auction.item} | **Precio:** ${auction.currentPrice} ${ICONS.money} | **Vendedor:** <@${auction.seller}>`;
            }).join('\n') || 'No hay subastas activas.';

            const embed = new EmbedBuilder()
            .setTitle(`${ICONS.auction} Casa de Subastas`)
            .setDescription(list)
            .setColor(COLORS.primary);
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'bid') {
            const id = options.getString('id');
            const amount = options.getInteger('monto');
            const data = getUserData(user.id);
            const auctions = getAuctions();

            if (!auctions[id]) return interaction.reply(`${ICONS.error} Subasta no encontrada.`);
            if (amount <= auctions[id].currentPrice) return interaction.reply(`${ICONS.error} La puja debe ser mayor al precio actual.`);
            if (data.wallet < amount) return interaction.reply(`${ICONS.error} No tienes suficiente dinero.`);

            data.wallet -= amount;
            updateUserData(user.id, data);
            placeBid(id, user.id, amount);
            return interaction.reply(`✅ Has pujado ${amount} ${ICONS.money} en la subasta \`${id}\`.`);
        }
    },
};