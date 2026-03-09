const { EmbedBuilder } = require('discord.js');
const { getTiendaHoy } = require('../data/items.js');
const { getUserData } = require('../userManager.js'); 
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'shop',
    async execute(input) {
        const user = input.user || input.author;
        const data = await getUserData(user.id);
        
        const tiendaCompleta = getTiendaHoy();
        const nekosPoseidos = data.nekos || {};

        const tiendaFiltrada = tiendaCompleta.filter(item => {
            if (item.id === 'koko' && nekosPoseidos.koko) {
                return false; 
            }
            return true; 
        });

        if (tiendaFiltrada.length === 0) {
            return input.reply(`${emojis()} La boutique está renovando su colección. ¡Vuelve pronto! 🌸`);
        }

        const shopEmbed = new EmbedBuilder()
            .setTitle(`${emojis()} ‧₊˚ Boutique Rockstar ˚₊‧ ${emojis()}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/7a/74/61/7a74614210626f2a890a880628292857.gif')
            .setDescription(
                `*“Lo que hoy es tendencia, mañana es leyenda...”* ✨\n\n` +
                `**୨୧ ┈┈┈┈ ${emojis()} Catálogo Rockstar ${emojis()} ┈┈┈┈ ୨୧**\n\n` +
                tiendaFiltrada.map(item => {
                    if (item.premium && data.premiumType === 'none') {
                        return `🔒 **Ítem VIP** ‧ *(Solo para Miembros Premium)*`;
                    }
                    return `${item.emoji} **${item.name}** ‧ \`${item.price.toLocaleString()} 🌸\``;
                }).join('\n') + 
                `\n\n**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n\n` +
                `${emojis.pinkbow} *Para comprar:* \`!!buy [nombre]\`\n` +
                `${emojis.pinkbow} *Para usar:* \`!!use [nombre]\``
            );

        return input.reply({ embeds: [shopEmbed] });
    }
};