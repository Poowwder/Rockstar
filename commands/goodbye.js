const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'goodbye',
    data: new SlashCommandBuilder()
        .setName('goodbye')
        .setDescription('👋 Panel de configuración de Despedidas')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuración de Despedidas Rockstar')
            .setDescription(
                'Usa los botones para diseñar el mensaje que aparecerá cuando alguien abandone el servidor.\n\n' +
                '🖼️ **Diseño:** Título, imagen, color, etc.\n' +
                '🧪 **Prueba:** Verifica cómo se ve el mensaje actual.'
            )
            .setColor('#FF6961'); // Un rojo pastel estético

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('conf_despedida').setLabel('Configurar Mensaje').setStyle(ButtonStyle.Danger).setEmoji('👋'),
            new ButtonBuilder().setCustomId('conf_preview_bye').setLabel('Vista Previa').setStyle(ButtonStyle.Secondary).setEmoji('👀'),
            new ButtonBuilder().setCustomId('conf_random_bye').setLabel('Random ✨').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};