const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Compra artículos y herramientas de la tienda'),

    async execute(interaction) {
        if (!fs.existsSync(shopPath)) return interaction.reply("❌ Error: No se encontró el archivo de la tienda.");
        const shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        // Filtrar solo items que se pueden comprar (que tienen buyPrice)
        const buyableItems = Object.entries(shopItems).filter(([id, item]) => item.buyPrice !== null);

        const embed = new EmbedBuilder()
            .setTitle('🏪 Tienda Rockstar')
            .setDescription('Selecciona un objeto del menú desplegable para comprarlo.')
            .setColor('#FFB6C1')
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                buyableItems.map(([id, item]) => ({
                    name: `${item.icon} ${item.name}`,
                    value: `💰 **Precio:** ${item.buyPrice} 🌸\n*${item.description}*`,
                    inline: true
                }))
            )
            .setFooter({ text: `Tu saldo: ${data.wallet || 0} 🌸` });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('shop_buy')
            .setPlaceholder('🛒 Elige un artículo...')
            .addOptions(
                buyableItems.map(([id, item]) => ({
                    label: item.name,
                    description: `Precio: ${item.buyPrice} 🌸`,
                    value: id,
                    emoji: item.icon
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const response = await interaction.reply({ embeds: [embed], components: [row] });

        // Colector de 60 segundos
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Esta tienda no es para ti.', ephemeral: true });

            const itemId = i.values[0];
            const item = shopItems[itemId];
            const freshData = await getUserData(userId);

            if ((freshData.wallet || 0) < item.buyPrice) {
                return i.reply({ content: `❌ No tienes suficientes flores. Te faltan ${item.buyPrice - freshData.wallet} 🌸`, ephemeral: true });
            }

            // Procesar compra
            freshData.wallet -= item.buyPrice;
            
            // Inicializar inventario si no existe
            if (!freshData.inventory) freshData.inventory = {};
            freshData.inventory[itemId] = (freshData.inventory[itemId] || 0) + 1;

            await updateUserData(userId, freshData);

            await i.reply({ 
                content: `✅ ¡Has comprado **${item.icon} ${item.name}**! Se ha añadido a tu inventario.`,
                ephemeral: false 
            });
        });
    }
};