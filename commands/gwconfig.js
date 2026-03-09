const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'gw-config',
    aliases: ['gw-settings'],
    async execute(message) {
        if (!message.member.permissions.has('Administrator')) return message.reply("🌸 Solo los admins pueden ver esto, reina. ✨");

        const destello = "✨";
        const corona = "👑";

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Configuración de Sorteos', iconURL: message.guild.iconURL() })
            .setTitle(`${corona} Panel Administrativo ${corona}`)
            .setDescription(
                `> 🎀 **Rol Manager:** \`Sin configurar\`\n` +
                `> 📝 **Logs de Sorteos:** \`Activados\`\n` +
                `> 🔄 **Último Refresh:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
                `*Usa los botones de abajo para gestionar el sistema, linda.* ✨`
            )
            .setColor('#FFB7C5')
            .setThumbnail(message.author.displayAvatarURL({ forceStatic: false }));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('set_role').setLabel('Rol Manager').setEmoji('🏹').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('view_logs').setLabel('Logs').setEmoji('📝').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('refresh_gw').setLabel('Refrescar').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
        );

        await message.reply({ 
            content: `${destello} **Abriendo el panel de control...** ${destello}`,
            embeds: [embed], 
            components: [row] 
        });
    }
};