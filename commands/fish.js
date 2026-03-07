const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, addItemToInventory } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const ICONS = {
    fish: '🎣',
    money: '🌸',
    error: '❌',
};
const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};
const THUMBNAILS = {
    default: 'https://i.imgur.com/3n1CHUC.png'
};

const getFishingZones = () => {
    const p = path.join(__dirname, '..', 'data', 'fishing_zones.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

const getShopItems = () => {
    const p = path.join(__dirname, '..', 'data', 'shop.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

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
        
        const cooldown = checkAndSetCooldown(userId, 'fish', 30); // 30 segundos de cooldown
        if (cooldown > 0) {
            return ctx.reply({ content: `⏳ Debes esperar **${cooldown.toFixed(1)}s** para volver a pescar.`, flags: MessageFlags.Ephemeral });
        }

        const data = getUserData(userId);
        const fishingZones = getFishingZones();
        const items = getShopItems();
        const fishingRod = data.inventory.find(item => item && item.id && item.id.startsWith('fishing_rod'));

        if (!fishingRod) {
            return ctx.reply({ content: `${ICONS.error} Necesitas una caña de pescar. ¡Compra una en la tienda!`, flags: MessageFlags.Ephemeral });
        }

        // Usaremos "lago" como zona por defecto, pero esto podría expandirse.
        const zone = fishingZones["lago"];
        if (!zone) {
            return ctx.reply({ content: `${ICONS.error} La zona de pesca "lago" no está configurada.`, flags: MessageFlags.Ephemeral });
        }

        const rand = Math.random() * 100;
        let caughtId = null;
        let cumulative = 0;

        for (const resource of zone.resources) {
            cumulative += resource.chance;
            if (rand < cumulative) {
                caughtId = resource.id;
                break;
            }
        }

        if (!caughtId) {
            return ctx.reply('No has pescado nada esta vez... mala suerte.');
        }

        addItemToInventory(userId, { id: caughtId, quantity: 1 });

        const itemInfo = items[caughtId];

        const embed = new EmbedBuilder()
            .setTitle('🎣 ¡Pesca Exitosa!')
            .setColor('#87CEEB');

        if (itemInfo) {
            embed.setDescription(`¡Has pescado 1x **${itemInfo.name}** ${itemInfo.icon}!`);
        } else {
            embed.setDescription(`¡Has pescado un objeto desconocido con ID: \`${caughtId}\`!`);
        }

        await ctx.reply({ embeds: [embed] });
    }
};