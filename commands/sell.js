const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

// --- 🛠️ ACTUALIZACIÓN DE RUTA ---
const sellPath = path.join(__dirname, '../data/sellPrices.json');

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'sell',
    description: '💰 Vende tus materiales en el mercado negro.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Vende tus materiales y objetos recolectados')
        .addStringOption(opt => 
            opt.setName('item')
                .setDescription('ID del objeto o "all" para vender todo')
                .setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);

        // 1. Cargar Precios desde el nuevo archivo sellPrices.json
        if (!fs.existsSync(sellPath)) return input.reply("❌ Error: No se encontró `sellPrices.json` en la carpeta data.");
        const sellItems = JSON.parse(fs.readFileSync(sellPath, 'utf8'));
        
        const data = await getUserData(user.id);
        const inv = data.inventory || {};
        const seleccion = isSlash ? input.options.getString('item').toLowerCase() : args?.[0]?.toLowerCase();

        if (!seleccion) return input.reply(`╰┈➤ ${e()} Indica qué vender: \`!!sell <item>\` o \`!!sell all\`.`);

        let gananciaTotal = 0;
        let itemsVendidos = [];
        let newInv = { ...inv };

        if (seleccion === 'all' || seleccion === 'todo') {
            for (const itemId in newInv) {
                const cantidad = newInv[itemId];
                const itemInfo = sellItems[itemId];

                if (cantidad > 0 && itemInfo && itemInfo.sellPrice) {
                    gananciaTotal += cantidad * itemInfo.sellPrice;
                    itemsVendidos.push(`${itemInfo.icon || '📦'} **${itemInfo.name}** x${cantidad}`);
                    newInv[itemId] = 0; 
                }
            }
        } else {
            // Buscamos el ítem por ID exacta o nombre aproximado
            const itemID = Object.keys(sellItems).find(id => 
                id === seleccion || sellItems[id].name.toLowerCase().includes(seleccion)
            );

            if (!itemID) return input.reply(`╰┈➤ ${e()} Ese objeto no tiene valor de mercado.`);
            const itemInfo = sellItems[itemID];
            
            const cantidad = inv[itemID] || 0;
            if (cantidad <= 0) return input.reply(`╰┈➤ ${e()} No tienes **${itemInfo.name}** en tu mochila.`);

            gananciaTotal = cantidad * itemInfo.sellPrice;
            itemsVendidos.push(`${itemInfo.icon || '📦'} **${itemInfo.name}** x${cantidad}`);
            newInv[itemID] = 0;
        }

        if (gananciaTotal === 0) return input.reply(`╰┈➤ ${e()} No tienes nada de valor para vender.`);

        data.wallet = (data.wallet || 0) + gananciaTotal;
        data.inventory = newInv;
        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setTitle(`${e()} Mercado Negro Rockstar ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/89/54/2a/89542a38217f7d9834460f380155a0b7.gif')
            .setDescription(
                `*“El dinero fluye donde la mercancía es rara...”*\n\n` +
                `**─── ✦ RECIBO DE VENTA ✦ ───**\n` +
                (itemsVendidos.length > 10 ? itemsVendidos.slice(0, 10).join('\n') + "\n*...y más*" : itemsVendidos.join('\n')) +
                `\n**──────────────────**\n` +
                `💰 **Ganancia:** \`+${gananciaTotal.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Cartera: ${data.wallet.toLocaleString()} 🌸 ⊹ Rockstar Nightfall` });

        return input.reply({ embeds: [embed] });
    }
};
