const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'goodbye',
    data: new SlashCommandBuilder()
        .setName('goodbye')
        .setDescription('👋 Panel de configuración de Despedidas Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuración de Despedidas Rockstar')
            .setDescription(
                'Usa los botones para diseñar el mensaje que aparecerá cuando alguien abandone el servidor.\n\n' +
                '🖼️ **Configurar:** Abre el editor para títulos e imágenes.\n' +
                '👀 **Nota:** El mensaje se enviará automáticamente en el canal donde uses este comando.'
            )
            .setColor('#FF6961') 
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_despedida')
                .setLabel('Configurar Mensaje')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('👋'),
            new ButtonBuilder()
                .setCustomId('conf_preview_bye')
                .setLabel('Vista Previa')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👀')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};