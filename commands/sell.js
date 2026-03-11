const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

// --- ✨ EMOJIS AL AZAR ---
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

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);

        // 1. Cargar Precios
        if (!fs.existsSync(shopPath)) return input.reply("❌ Error: No se encontró el registro de precios (`shop.json`).");
        const shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        
        const data = await getUserData(user.id);
        const inv = data.inventory || {};
        const seleccion = isSlash ? input.options.getString('item').toLowerCase() : input.args?.[0]?.toLowerCase();

        if (!seleccion) return input.reply(`╰┈➤ ${e()} Indica qué quieres vender: \`!!sell <item>\` o \`!!sell all\`.`);

        let gananciaTotal = 0;
        let itemsVendidos = [];

        // --- ⚖️ LÓGICA DE VENTA ---
        if (seleccion === 'all' || seleccion === 'todo') {
            for (const itemId in inv) {
                const cantidad = inv[itemId];
                const itemInfo = shopItems[itemId];

                if (cantidad > 0 && itemInfo && itemInfo.sellPrice) {
                    const venta = cantidad * itemInfo.sellPrice;
                    gananciaTotal += venta;
                    itemsVendidos.push(`${itemInfo.icon || '📦'} **${itemInfo.name}** x${cantidad} ➔ \`+${venta.toLocaleString()}\``);
                    inv[itemId] = 0; 
                }
            }
        } else {
            const itemInfo = shopItems[seleccion];
            if (!itemInfo) return input.reply(`╰┈➤ ${e()} Ese objeto no tiene valor en el mercado.`);
            if (!itemInfo.sellPrice) return input.reply(`╰┈➤ ${e()} El objeto **${itemInfo.name}** no se puede vender.`);
            
            const cantidad = inv[seleccion] || 0;
            if (cantidad <= 0) return input.reply(`╰┈➤ ${e()} No tienes **${itemInfo.name}** en tu mochila.`);

            gananciaTotal = cantidad * itemInfo.sellPrice;
            itemsVendidos.push(`${itemInfo.icon || '📦'} **${itemInfo.name}** x${cantidad} ➔ \`+${gananciaTotal.toLocaleString()}\``);
            inv[seleccion] = 0;
        }

        if (gananciaTotal === 0) return input.reply(`╰┈➤ ${e()} No tienes nada de valor para vender ahora mismo.`);

        // 2. Guardar Cambios
        data.wallet = (data.wallet || 0) + gananciaTotal;
        data.inventory = inv;
        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setTitle(`${e()} Mercado Negro Rockstar ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/89/54/2a/89542a38217f7d9834460f380155a0b7.gif')
            .setDescription(
                `*“El dinero fluye donde la mercancía es rara...”*\n\n` +
                `**─── ✦ RECIBO DE VENTA ✦ ───**\n` +
                itemsVendidos.join('\n') +
                `\n**──────────────────**\n` +
                `💰 **Ganancia Total:** \`+${gananciaTotal.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Cartera: ${data.wallet.toLocaleString()} 🌸 ⊹ Rockstar Nightfall` });

        return input.reply({ embeds: [embed] });
    }
};
