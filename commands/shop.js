const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shop',
    aliases: ['tienda', 'store'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Mira los artículos disponibles en la Boutique Rockstar'),

    async execute(input) {
        const member = input.member;
        const user = input.user || input.author;

        const shopEmbed = new EmbedBuilder()
            .setTitle('🛍️ Boutique Rockstar - Catálogo')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/7a/74/61/7a74614210626f2a890a880628292857.gif') // Una tienda cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `**¡Holi, ${member.displayName}!** ✨\n` +
                `Aquí tienes los artículos disponibles hoy:\n\n` +
                `💍 **Anillo de Compromiso**\n` +
                `╰┈➤ Precio: \`10,000 🌸\`\n` +
                `╰┈➤ *Necesario para usar el comando de boda.*\n\n` +
                `🛡️ **Escudo de Flores**\n` +
                `╰┈➤ Precio: \`5,000 🌸\`\n` +
                `╰┈➤ *Te protege de un robo (rob/crime).*\n\n` +
                `💎 **Pase VIP Rockstar**\n` +
                `╰┈➤ Precio: \`50,000 🌸\`\n` +
                `╰┈➤ *Acceso a zonas exclusivas en /mine.*\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `💡 *Para comprar algo, usa: ` + "!!buy [nombre]`*"
            )
            .setTimestamp()
            .setFooter({ 
                text: `Boutique visitada por: ${member.displayName}`, 
                iconURL: user.displayAvatarURL() 
            });

        return input.reply({ embeds: [shopEmbed] });
    }
};