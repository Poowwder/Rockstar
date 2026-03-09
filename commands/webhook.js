const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'webhook-master',
    data: new SlashCommandBuilder()
        .setName('webhook-master')
        .setDescription('👑 Crea un Embed ultra personalizado vía Webhook')
        .addChannelOption(option => option.setName('canal').setDescription('Donde enviar').setRequired(true)),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        const modal = new ModalBuilder()
            .setCustomId(`webhook_super_${canal.id}`)
            .setTitle('Diseño de Embed Rockstar');

        // Campos del Formulario
        const titleInput = new TextInputBuilder().setCustomId('w_title').setLabel('Título').setStyle(TextInputStyle.Short).setRequired(false);
        const descInput = new TextInputBuilder().setCustomId('w_desc').setLabel('Descripción').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const colorInput = new TextInputBuilder().setCustomId('w_color').setLabel('Color Hex (Ej: #FFB6C1)').setStyle(TextInputStyle.Short).setRequired(false);
        const imageInput = new TextInputBuilder().setCustomId('w_image').setLabel('URL Imagen Grande').setStyle(TextInputStyle.Short).setRequired(false);
        const footerInput = new TextInputBuilder().setCustomId('w_footer').setLabel('Texto del Footer').setStyle(TextInputStyle.Short).setRequired(false);

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