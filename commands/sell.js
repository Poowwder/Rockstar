const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Vende tus materiales y objetos recolectados')
        .addStringOption(opt => 
            opt.setName('item')
                .setDescription('Qué quieres vender (ID del objeto o "all" para todo)')
                .setRequired(true)),

    async execute(interaction) {
        // 1. Cargar datos
        if (!fs.existsSync(shopPath)) return interaction.reply("❌ Error: No se encontró el archivo de precios.");
        const shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const inv = data.inventory || {};

        // El adaptador del index.js nos permite obtener el string si es !sell madera
        const seleccion = interaction.options.getString('item').toLowerCase();

        let gananciaTotal = 0;
        let reporte = "";

        // --- LÓGICA: VENDER TODO ---
        if (seleccion === 'all' || seleccion === 'todo') {
            for (const itemId in inv) {
                const cantidad = inv[itemId];
                const itemInfo = shopItems[itemId];

                // Solo vendemos si el item existe en el JSON y tiene un sellPrice
                if (cantidad > 0 && itemInfo && itemInfo.sellPrice) {
                    const venta = cantidad * itemInfo.sellPrice;
                    gananciaTotal += venta;
                    reporte += `${itemInfo.icon || '📦'} **${cantidad}x ${itemInfo.name}**: +${venta} 🌸\n`;
                    inv[itemId] = 0; // Vaciamos ese item del inventario
                }
            }
        } 
        // --- LÓGICA: VENDER UN ITEM ESPECÍFICO ---
        else {
            const itemInfo = shopItems[seleccion];
            
            if (!itemInfo) return interaction.reply("❌ Ese objeto no existe en nuestra base de datos.");
            if (!itemInfo.sellPrice) return interaction.reply(`❌ El objeto **${itemInfo.name}** no se puede vender.`);
            
            const cantidad = inv[seleccion] || 0;
            if (cantidad <= 0) return interaction.reply(`❌ No tienes **${itemInfo.name}** en tu inventario.`);

            gananciaTotal = cantidad * itemInfo.sellPrice;
            reporte = `✅ Has vendido **${cantidad}x ${itemInfo.name}** por **${gananciaTotal} 🌸**.`;
            inv[seleccion] = 0;
        }

        if (gananciaTotal === 0) {
            return interaction.reply("❌ No tienes nada que se pueda vender en este momento.");
        }

        // 2. Guardar cambios
        data.wallet = (data.wallet || 0) + gananciaTotal;
        data.inventory = inv;
        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle('💰 Mercado de Rockstar')
            .setDescription(reporte)
            .setColor('#2ecc71')
            .setThumbnail('https://i.imgur.com/89H8tS1.png') // Opcional: una imagen de monedas
            .setFooter({ text: `Nuevo saldo: ${data.wallet} 🌸` });

        return interaction.reply({ embeds: [embed] });
    }
};