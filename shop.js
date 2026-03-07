const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory, shopItems } = require('../economyManager.js'); // Asegúrate de que la ruta es correcta

const ICONS = {
    shop: '🛍️',
    money: '🌸',
    error: '❌',
    item: '📦',
};

const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra los items disponibles en la tienda.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Muestra los items disponibles en la tienda.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Compra un item de la tienda.')
                .addStringOption(option => option.setName('item_id').setDescription('ID del item a comprar.').setRequired(true))),
    category: 'currency',
    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            return this.listItems(interaction);
        } else if (sub === 'buy') {
            return this.buyItem(interaction);
        }
    },

    async listItems(interaction) {
        const items = shopItems()

        let description = '';
        for (const itemId in items) {
            const item = items[itemId];
            description += `**${item.name}** (${itemId}) - ${item.price} ${ICONS.money}\n${item.description}\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.shop} Tienda`)
            .setDescription(description || 'No hay items disponibles en la tienda.')
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    },

    async buyItem(interaction) {
        const itemId = interaction.options.getString('item_id');
        const userId = interaction.user.id;
        const data = getUserData(userId);
        const items = shopItems()

        const itemToBuy = items[itemId];
        if (!itemToBuy) {
            return interaction.reply({ content: `${ICONS.error} Item no encontrado en la tienda.`, flags: MessageFlags.Ephemeral });
        }

        if (data.wallet < itemToBuy.price) {
            return interaction.reply({ content: `${ICONS.error} No tienes suficiente dinero para comprar este item.`, flags: MessageFlags.Ephemeral });
        }

        data.wallet -= itemToBuy.price;
        addItemToInventory(userId, { id: itemId, quantity: 1 });
        updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.item} Compra Exitosa`)
            .setDescription(`Has comprado **${itemToBuy.name}** por ${itemToBuy.price} ${ICONS.money}.`)
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    },
};

/*
COMMAND: shop
CATEGORY: currency

!!shop list - Muestra los items disponibles en la tienda.
!!shop buy <item_id> - Compra un item de la tienda.

USAGE
/shop list
/shop buy [item_id: string]
*/