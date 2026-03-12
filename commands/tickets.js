const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ActionRowBuilder, PermissionFlagsBits 
} = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'tickets',
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('🎫 Diseña tu propio panel de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // --- 👁️ LOG AUTOMÁTICO ---
        await sendAuditLog(interaction.guild, {
            title: '⊹ Acceso a Configuración de Tickets ⊹',
            description: `**Administrador:** ${interaction.user.tag}\n> *Se ha iniciado el protocolo de edición del panel.*`,
            icon: interaction.user.displayAvatarURL()
        });

        const modal = new ModalBuilder()
            .setCustomId('setup_ticket_modal')
            .setTitle('Configurar Panel de Tickets');

        const titleInput = new TextInputBuilder()
            .setCustomId('panel_title').setLabel("Título del Panel").setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 📩 Centro de Asistencia ⊹ Rockstar').setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('panel_desc').setLabel("Descripción / Reglas").setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ej: Describe tu conflicto. El equipo te asistirá pronto...').setRequired(true);

        const buttonInput = new TextInputBuilder()
            .setCustomId('panel_button').setLabel("Texto del Botón").setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Abrir Expediente 🎫').setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(buttonInput)
        );

        await interaction.showModal(modal);
    }
};
