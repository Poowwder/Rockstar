const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserData } = require('../userManager.js'); // ✅ Corregido: Usamos userManager
const emojis = require('../utils/emojiHelper.js'); // ✅ Emojis inteligentes

module.exports = {
    name: 'market',
    data: new SlashCommandBuilder().setName('market').setDescription('🔨 Mercado de Subastas VIP'),

    async execute(input) {
        const user = input.user || input.author;
        const member = input.member;
        
        // Obtenemos los datos del usuario para verificar el Premium
        let data = await getUserData(user.id);

        // --- 🔒 VERIFICACIÓN PREMIUM ---
        if (!data.premiumType || data.premiumType === 'none' || data.premiumType === 'normal') {
            const noVip = new EmbedBuilder()
                .setTitle(`${emojis.exclamation} ‧₊˚ Acceso Privado ˚₊‧`)
                .setColor('#FF9AA2')
                .setThumbnail('https://i.pinimg.com/originals/a0/6c/4a/a06c4a93883a908a8e32918f0f09a18d.gif')
                .setDescription(`╰┈➤ ${emojis.pinkbow} **${member.displayName}**, este mercado es solo para miembros **Premium**. ¡Pide tu pase para ver estas maravillas! ✨`);
            
            return input.reply({ embeds: [noVip], ephemeral: true });
        }

        // --- 🔨 EMBED DEL MERCADO ---
        const marketEmbed = new EmbedBuilder()
            .setTitle(`${emojis()} ‧₊˚ Subasta Rockstar ˚₊‧ ${emojis()}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
            .setDescription(
                `*“Solo lo mejor de lo mejor...”* ✨\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈ ${emojis()} ┈┈┈┈┈┈┈┈ ୨୧**\n` +
                `${emojis.star} **Item:** \`Corona de Flores Diamante\`\n` +
                `${emojis.points} **Puja:** \`150,000 flores\`\n` +
                `${emojis.pinkstars} **Postor:** \`Ninguno\`\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n\n` +
                `╰┈➤ *¿Te atreves a pujar por esta joya?*`
            )
            .setFooter({ text: `Boutique Premium • ${member.displayName} ♡` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bid')
                .setEmoji(emojis.pinkbow) // Lazo rosa de tu JSON
                .setLabel('Pujar +10k')
                .setStyle(ButtonStyle.Secondary)
        );

        return input.reply({ embeds: [marketEmbed], components: [row] });
    }
};