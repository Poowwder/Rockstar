const { EmbedBuilder } = require('discord.js');
const shopItems = require('../data/shop.json');

module.exports = {
    name: 'shop',
    aliases: ['tienda', 'store'],
    async execute(message, args) {
        // Formatear los items de tu JSON
        let itemList = "";
        for (const [key, value] of Object.entries(shopItems)) {
            itemList += `✨ **${value.name}** — 🌸 \`${value.price}\` flores\n*${value.description || 'Sin descripción'}*\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🌸 Rockstar Boutique')
            .setDescription('¡Bienvenida a la tienda! Aquí puedes gastar tus flores en cosas lindas.\n\n' + itemList)
            .setColor('#FFB6C1')
            // Imagen aesthetic de un gatito en una tienda/café
            .setThumbnail('https://i.pinimg.com/originals/7e/3d/cc/7e3dcc73a388f61a7a1c431477431e21.gif')
            .setFooter({ text: 'Usa !!buy [nombre] para comprar algo ✨' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};