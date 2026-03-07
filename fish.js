const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, addItemToInventory, removeItemFromInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');

const petsDataPath = path.join(__dirname, '../../pets.json');
const ICONS = {
    fish: '🎣',
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

const getFishingZones = () => {
    const p = path.join(__dirname, '../../fishing_zones.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

const getShopItems = () => {
    const p = path.join(__dirname, '../../shop.json');
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
        .setName('fish')
        .setDescription('Pesca en diferentes zonas.'),
    category: 'currency',
    description: 'Pesca en diferentes zonas.',
    usage: '!!fish',
    async execute(message, args) {
        await this.fishLogic(message);
    },
    async executeSlash(interaction) {
        await this.fishLogic(interaction);
    },

    async fishLogic(ctx) {
        const user = ctx.user || ctx.author;
        const userId = user.id;
        const data = getUserData(userId);

        // Check cooldown
        const cooldown = checkAndSetCooldown(userId, 'fish', 300);
        if (cooldown > 0) return ctx.reply({ content: `⏳ Debes esperar ${(cooldown / 1000).toFixed(1)}s para volver a pescar.`, flags: MessageFlags.Ephemeral });

        const fishingZones = getFishingZones();
        const items = getShopItems();
        const fishingRod = data.inventory.find(item => item.id.startsWith('fishing_rod'));

        if (!fishingRod) return ctx.reply({ content: `${ICONS.error} Necesitas una caña de pescar. ¡Compra una en la tienda!`, flags: MessageFlags.Ephemeral });

        const zone = fishingZones["lago"];
        if (!zone) return ctx.reply({ content: `${ICONS.error} Zona de pesca inválida.`, flags: MessageFlags.Ephemeral });

        const rand = Math.random() * 100;
        let caught = null;
        let cumulative = 0;

        for (const resource of zone.resources) {
            cumulative += resource.chance;
            if (rand < cumulative) {
                caught = resource.id;
                break;
            }
        }

        if (!caught) return ctx.reply('No has pescado nada esta vez...');

        addItemToInventory(userId, caught, 1);

        let itemInfo = items[caught]

        if (!itemInfo || itemInfo === null || itemInfo === undefined) {
            itemInfo = {
                name: 'Pescado Raro',
                icon: '?'
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎣 ¡Pesca Exitosa!')
            .setDescription(`¡Has pescado 1x ${itemInfo.name} ${itemInfo.icon}!`)
            .setColor('#87CEEB') // Azul cielo
            .setFooter({ text: 'Buena pesca!' });

        await ctx.reply({ embeds: [embed] });
    }
};