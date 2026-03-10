const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    PermissionFlagsBits,
    ChannelType 
} = require('discord.js');

module.exports = {
    name: 'webhook',
    description: '👑 Crea un mensaje estético (Embed) mediante Webhooks.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('👑 Crea un Embed personalizado vía Webhook')
        .addChannelOption(option => 
            option.setName('canal')
                .setDescription('¿En qué canal quieres enviar el anuncio?')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        // El ID del canal se pasa en el CustomID para que el index lo capture
        const modal = new ModalBuilder()
            .setCustomId(`webhook_super_${canal.id}`)
            .setTitle('🎨 Diseñador de Anuncios Rockstar');

        // --- CAMPOS DEL FORMULARIO ---
        const titleInput = new TextInputBuilder()
            .setCustomId('w_title')
            .setLabel('Título del Anuncio')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: ✨ ¡Novedades del Servidor! ✨')
            .setRequired(false);

        const descInput = new TextInputBuilder()
            .setCustomId('w_desc')
            .setLabel('Descripción / Contenido')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Escribe aquí el cuerpo del mensaje...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('w_color')
            .setLabel('Color Hexadecimal')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: #FFB6C1')
            .setRequired(false);

        const imageInput = new TextInputBuilder()
            .setCustomId('w_image')
            .setLabel('URL de la Imagen Grande')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://enlace-a-tu-imagen.png')
            .setRequired(false);

        const footerInput = new TextInputBuilder()
            .setCustomId('w_footer')
            .setLabel('Texto del Footer (Pie de página)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Atentamente, Staff de Rockstar')
            .setRequired(false);

        // Añadimos los 5 campos permitidos por Discord
        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(footerInput)
        );

        await interaction.showModal(modal);
    }
};