const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'market',
    data: new SlashCommandBuilder().setName('market').setDescription('🔨 Mercado de Subastas VIP'),

    async execute(input) {
        const user = input.user || input.author;
        const member = input.member;
        let data = await getUserData(user.id);

        if (!data.premiumType || data.premiumType === 'normal') {
            const noVip = new EmbedBuilder()
                .setTitle('🔒 ‧₊˚ Acceso Privado ˚₊‧')
                .setColor('#FF9AA2')
                .setThumbnail('https://i.pinimg.com/originals/a0/6c/4a/a06c4a93883a908a8e32918f0f09a18d.gif')
                .setDescription(`╰┈➤ 🌸 **${member.displayName}**, este mercado es solo para miembros **Premium**. ¡Pide tu pase para ver estas maravillas! ✨`);
            return input.reply({ embeds: [noVip], ephemeral: true });
        }

        const marketEmbed = new EmbedBuilder()
            .setTitle(`🔨 ‧₊˚ Subasta Rockstar ˚₊‧ 🔨`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
            .setDescription(
                `*“Solo lo mejor de lo mejor...”* ✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `✨ **Item:** \`Corona de Flores Diamante\`\n` +
                `💰 **Puja:** \`150,000 flores\`\n` +
                `👑 **Postor:** \`Ninguno\`\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¿Te atreves a pujar por esta joya?*`
            )
            .setFooter({ text: `Boutique Premium de ${member.displayName} ♡` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bid').setLabel('🎀 Pujar +10k').setStyle(ButtonStyle.Secondary)
        );

        return input.reply({ embeds: [marketEmbed], components: [row] });
    }
};