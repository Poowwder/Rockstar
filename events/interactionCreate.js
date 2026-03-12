const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ChannelType, PermissionFlagsBits, Events 
} = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const { guild, client, user } = interaction;

        // --- 1. MANEJO DE COMANDOS (SLASH COMMANDS) ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: '╰┈➤ ❌ Error al ejecutar el comando en las sombras.', 
                    ephemeral: true 
                });
            }
        }

        // --- 2. MANEJO DE MODALES (CONFIGURACIÓN) ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'setup_ticket_modal') {
                const title = interaction.fields.getTextInputValue('panel_title');
                const desc = interaction.fields.getTextInputValue('panel_desc');
                const btnText = interaction.fields.getTextInputValue('panel_button');

                const panelEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor('#1a1a1a')
                    .setFooter({ text: 'Rockstar ⊹ Sistema de Soporte' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_ticket')
                        .setLabel(btnText)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📩')
                );

                await interaction.reply({ content: '╰┈➤ ✅ Panel de tickets generado.', ephemeral: true });
                return interaction.channel.send({ embeds: [panelEmbed], components: [row] });
            }
        }

        // --- 3. MANEJO DE BOTONES (ABRIR / ACEPTAR / CERRAR) ---
        if (interaction.isButton()) {
            
            // --- ABRIR TICKET ---
            if (interaction.customId === 'open_ticket') {
                try {
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                        ],
                    });

                    const ticketEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Nuevo Expediente de Soporte ⊹', iconURL: user.displayAvatarURL() })
                        .setDescription(`╰┈➤ 🌑 **Bienvenido.**\n> Describe tu situación detalladamente.\n\n**Usuario:** ${user.tag}\n**ID:** \`${user.id}\``);

                    const rowActions = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('accept_ticket').setLabel('Aceptar').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Clausurar').setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ content: `<@${user.id}>`, embeds: [ticketEmbed], components: [rowActions] });
                    await interaction.reply({ content: `╰┈➤ 🎫 Ticket abierto: ${ticketChannel}`, ephemeral: true });

                    // 👁️ LOG AUTOMÁTICO
                    await sendAuditLog(guild, {
                        title: '⊹ Apertura de Expediente ⊹',
                        description: `**Usuario:** ${user.tag}\n**Canal:** ${ticketChannel}\n> *Un nuevo ticket ha sido generado.*`,
                        icon: user.displayAvatarURL()
                    });

                } catch (e) {
                    console.error(e);
                    await interaction.reply({ content: '╰┈➤ ❌ Error al crear el canal de ticket.', ephemeral: true });
                }
            }

            // --- ACEPTAR TICKET ---
            if (interaction.customId === 'accept_ticket') {
                await interaction.reply({ content: `╰┈➤ ⚖️ Este caso ha sido tomado por: **${user.tag}**.` });

                // 👁️ LOG AUTOMÁTICO
                await sendAuditLog(guild, {
                    title: '⊹ Ticket Aceptado ⊹',
                    description: `**Moderador:** ${user.tag}\n**Canal:** ${interaction.channel}\n> *La asistencia está en curso.*`,
                    color: '#2ecc71'
                });
            }

            // --- CERRAR TICKET ---
            if (interaction.customId === 'close_ticket') {
                await interaction.reply('╰┈➤ 🌑 **Clausurando expediente...**');

                // 👁️ LOG AUTOMÁTICO
                await sendAuditLog(guild, {
                    title: '⊹ Expediente Clausurado ⊹',
                    description: `**Cerrado por:** ${user.tag}\n**Canal original:** \`${interaction.channel.name}\`\n> *Historial archivado y canal eliminado.*`,
                    color: '#e74c3c'
                });

                // Borramos después de 5 segundos para dar tiempo al log
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    }
};
