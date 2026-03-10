const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ActionRowBuilder, PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    name: 'embed',
    description: '🖼️ Crea un mensaje estético personalizado mediante un formulario.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('🖼️ Diseña un embed con formulario')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async executeSlash(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('embed_modal')
            .setTitle('Diseñar Mensaje Estético');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Título del Embed")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: ✨ ¡Novedades del Servidor! ✨')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Contenido / Descripción")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Escribe aquí el mensaje...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel("Color Hexadecimal (Opcional)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#FFB6C1')
            .setRequired(false);

        const imageInput = new TextInputBuilder()
            .setCustomId('image')
            .setLabel("URL de la Imagen (Opcional)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://enlace-imagen.png')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(modal);
    }
};