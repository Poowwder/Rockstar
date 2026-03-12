const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder 
} = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión para logs

module.exports = {
    name: 'tickets',
    description: '🎫 Configura el panel de soporte con un formulario de edición.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('🎫 Diseña tu propio panel de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
        try {
            const config = await GuildConfig.findOne({ GuildID: interaction.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = interaction.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ 
                            name: '⊹ Acceso a Configuración de Tickets ⊹', 
                            iconURL: interaction.user.displayAvatarURL() 
                        })
                        .setDescription(
                            `**Administrador:** ${interaction.user.tag}\n` +
                            `> *Se ha iniciado el protocolo de edición del panel de soporte.*`
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error enviando log de tickets:", error);
        }

        // --- 📑 CREACIÓN DEL MODAL ---
        const modal = new ModalBuilder()
            .setCustomId('setup_ticket_modal')
            .setTitle('Configurar Panel de Tickets');

        const titleInput = new TextInputBuilder()
            .setCustomId('panel_title')
            .setLabel("Título del Panel")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 📩 Centro de Asistencia ⊹ Rockstar')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('panel_desc')
            .setLabel("Descripción / Reglas")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ej: Describe tu conflicto. El equipo de las sombras te asistirá pronto...')
            .setRequired(true);

        const buttonInput = new TextInputBuilder()
            .setCustomId('panel_button')
            .setLabel("Texto del Botón")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Abrir Expediente 🎫')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(buttonInput)
        );

        await interaction.showModal(modal);
    }
};
