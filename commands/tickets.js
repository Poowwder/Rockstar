const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ActionRowBuilder, PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    name: 'tickets',
    description: '🎫 Configura el panel de soporte con un formulario de edición.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('🎫 Diseña tu propio panel de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) { // Cambiado a execute para que el index lo reconozca
        const modal = new ModalBuilder()
            .setCustomId('setup_ticket_modal')
            .setTitle('Configurar Panel de Tickets');

        const titleInput = new TextInputBuilder()
            .setCustomId('panel_title')
            .setLabel("Título del Panel")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 📩 Soporte Rockstar')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('panel_desc')
            .setLabel("Descripción / Reglas")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ej: Abre un ticket para reportes o dudas...')
            .setRequired(true);

        const buttonInput = new TextInputBuilder()
            .setCustomId('panel_button')
            .setLabel("Texto del Botón")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Abrir Ticket 🎫')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(buttonInput)
        );

        await interaction.showModal(modal);
    }
};