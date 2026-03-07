const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const ICONS = {
    loot: '🎁',
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

const getLootBoxes = () => {
    const p = path.join(__dirname, '..', 'data', 'lootboxes.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

const getShopItems = () => {
    const p = path.join(__dirname, '..', 'data', 'shop.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cajadebotin')
        .setDescription('Gestiona tus cajas de botín.')
        .addSubcommand(sub => sub.setName('open').setDescription('Abre una caja de botín.').addStringOption(o => o.setName('id').setDescription('ID de la caja a abrir').setRequired(true))),
    category: 'currency',
    description: 'Abre cajas de botín.',
    usage: '!!lootbox <open>',
    aliases: ['lootboxes', 'caja', 'cajas'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/cajadebotin` para las cajas de botín.');
    },
    async executeSlash(interaction) {
        const { options, user } = interaction;
        const sub = interaction.options.getSubcommand();

        if (sub === 'open') {
            await interaction.deferReply();

            const lootboxId = options.getString('id');
            const data = getUserData(user.id);
            const lootboxes = getLootBoxes();
            const shopItems = getShopItems();

            const lootboxToOpen = lootboxes[lootboxId];
            if (!lootboxToOpen) {
                return interaction.editReply({ content: `${ICONS.error} Caja de botín no encontrada.`, ephemeral: true });
            }

            const boxInInventory = data.inventory.find(item => item && item.id === lootboxId);
            if (!boxInInventory) {
                return interaction.editReply({ content: `${ICONS.error} No tienes esa caja de botín en tu inventario.`, ephemeral: true });
            }

            // Lógica para abrir la caja
            const rewards = lootboxToOpen.rewards;
            const rand = Math.random() * 100;
            let cumulative = 0;
            let receivedReward = null;

            for (const reward of rewards) {
                cumulative += reward.chance;
                if (rand < cumulative) {
                    receivedReward = reward;
                    break;
                }
            }

            if (!receivedReward) {
                return interaction.editReply({ content: 'No has obtenido ninguna recompensa esta vez. ¡Qué mala suerte!', ephemeral: true });
            }

            // Quitar la caja del inventario y añadir la recompensa
            removeItemFromInventory(user.id, lootboxId, 1);
            addItemToInventory(user.id, { id: receivedReward.id, quantity: receivedReward.quantity || 1 });
            
            const itemInfo = shopItems[receivedReward.id];
            const rewardName = itemInfo ? itemInfo.name : `un objeto (ID: ${receivedReward.id})`;

            const embed = new EmbedBuilder()
                .setTitle(`${ICONS.loot} ¡Caja Abierta!`)
                .setDescription(`Abriste una **${lootboxToOpen.name}** y recibiste:\n\n» **${receivedReward.quantity || 1}x ${rewardName}**`)
                .setColor(COLORS.primary)
                .setThumbnail(itemInfo?.icon || THUMBNAILS.default);

            await interaction.editReply({ embeds: [embed] });
        }
    },
};