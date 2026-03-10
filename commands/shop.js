const { EmbedBuilder } = require('discord.js');
const { getTiendaHoy } = require('../data/items.js');
const { getUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'shop',
    async execute(input) {
        const user = input.user || input.author;
        const guild = input.guild;
        
        // 1. Lógica de Emojis Random (Lo que hicimos ayer ✨)
        const botEmojis = guild.emojis.cache.filter(e => e.available);
        const getRndEmoji = () => botEmojis.size > 0 ? botEmojis.random().toString() : '✨';
        
        const emoji1 = getRndEmoji();
        const emoji2 = getRndEmoji();

        const data = await getUserData(user.id);
        const profileDB = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
        
        const tiendaCompleta = getTiendaHoy();

        const tiendaFiltrada = tiendaCompleta.filter(item => {
            if (item.id.toLowerCase() === 'astra') {
                const tieneAstra = profileDB?.Nekos?.some(url => url.includes('ASTRA')) || false;
                if (tieneAstra) return false; 
            }
            if (item.id.toLowerCase() === 'koko') {
                const tieneKoko = profileDB?.Nekos?.some(url => url.includes('KOKO')) || false;
                if (tieneKoko) return false;
            }
            return true; 
        });

        if (tiendaFiltrada.length === 0) {
            return input.reply(`${emoji1} La boutique está renovando su colección. ¡Vuelve pronto! 🌸`);
        }

        const shopEmbed = new EmbedBuilder()
            .setTitle(`${emoji1} ‧₊˚ Boutique Rockstar ˚₊‧ ${emoji2}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/7a/74/61/7a74614210626f2a890a880628292857.gif')
            .setDescription(
                `*“Lo que hoy es tendencia, mañana es leyenda...”* ✨\n\n` +
                `**୨୧ ┈┈┈┈ ${emoji1} Catálogo Rockstar ${emoji2} ┈┈┈┈ ୨୧**\n\n` +
                tiendaFiltrada.map(item => {
                    if (item.premium && data.premiumType === 'none') {
                        return `🔒 **Ítem VIP** ‧ *(Solo para Miembros Premium)*`;
                    }
                    return `${item.emoji} **${item.name}** ‧ \`${item.price.toLocaleString()} 🌸\``;
                }).join('\n') + 
                `\n\n**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n\n` +
                `${emojis.pinkbow} *Para adquirir:* \`!!buy [nombre]\`\n` +
                `${emojis.pinkbow} *Para gestionar:* \`!!use [nombre]\``
            )
            .setFooter({ text: `Consultado por: ${user.username} ♡`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [shopEmbed] });
    }
};