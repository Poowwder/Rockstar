const { 
    EmbedBuilder, 
    InteractionType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

// Usamos las funciones de Guild (Servidor) para configuraciones globales
const { getGuildData, updateGuildData } = require('../userManager.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // --- 1. COMANDOS SLASH (BARRA) ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
            }
        }

        // --- 2. MANEJO DE BOTONES ---
        if (interaction.isButton()) {
            
            // Panel de Configuración Visual (Welcome/Bye)
            if (interaction.customId.startsWith('conf_')) {
                
                // Botón de Vista Previa
                if (interaction.customId === 'conf_preview' || interaction.customId === 'conf_preview_bye') {
                    const data = await getGuildData(guildId);
                    const type = interaction.customId.includes('bye') ? 'despedida' : 'welcome_1';
                    const config = data.welcomeConfig?.[type];

                    if (!config) return interaction.reply({ content: '❌ No hay configuración guardada para esta sección.', ephemeral: true });

                    const preview = new EmbedBuilder()
                        .setTitle(`👀 Vista Previa: ${type.toUpperCase()}`)
                        .setColor(config.color || '#FFB6C1')
                        .addFields(
                            { name: 'Canal', value: `<#${config.channelId}>`, inline: true },
                            { name: 'Timestamp', value: config.timestamp || 'no', inline: true }
                        )
                        .setDescription(config.desc || '*Sin descripción*');
                    
                    return interaction.reply({ embeds: [preview], ephemeral: true });
                }

                // Abrir Modal de Configuración
                const type = interaction.customId.replace('conf_', '');
                const modal = new ModalBuilder()
                    .setCustomId(`modal_conf_${type}`)
                    .setTitle(`Configurar ${type.toUpperCase()}`);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('m_title').setLabel('Título').setStyle(TextInputStyle.Short).setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('m_desc').setLabel('Descripción ({taguser}, {membercount})').setStyle(TextInputStyle.Paragraph).setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('m_footer').setLabel('Texto del Footer').setStyle(TextInputStyle.Short).setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('m_timestamp').setLabel('¿Timestamp? (yes / no)').setStyle(TextInputStyle.Short).setPlaceholder('yes').setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('m_canal').setLabel('ID del Canal (Obligatorio)').setStyle(TextInputStyle.Short).setRequired(true))
                );

                await interaction.showModal(modal);
            }

            // Sistema de Reaction Roles
            if (interaction.customId.startsWith('rr_')) {
                const roleId = interaction.customId.split('_')[1];
                const role = interaction.guild.roles.cache.get(roleId);
                if (!role) return interaction.reply({ content: '❌ Rol no encontrado.', ephemeral: true });

                try {
                    if (interaction.member.roles.cache.has(roleId)) {
                        await interaction.member.roles.remove(role);
                        await interaction.reply({ content: `🌸 Rol removido: **${role.name}**`, ephemeral: true });
                    } else {
                        await interaction.member.roles.add(role);
                        await interaction.reply({ content: `✅ Rol asignado: **${role.name}**`, ephemeral: true });
                    }
                } catch (e) {
                    await interaction.reply({ content: '❌ No tengo permisos suficientes.', ephemeral: true });
                }
            }
        }

        // --- 3. ENVÍO DE FORMULARIOS (MODALS) ---
        if (interaction.type === InteractionType.ModalSubmit) {
            
            // Guardar Configuración de Bienvenidas / Despedidas
            if (interaction.customId.startsWith('modal_conf_')) {
                const type = interaction.customId.replace('modal_conf_', '');
                let data = await getGuildData(guildId);
                
                if (!data.welcomeConfig) data.welcomeConfig = {};

                data.welcomeConfig[type] = {
                    title: interaction.fields.getTextInputValue('m_title') || null,
                    desc: interaction.fields.getTextInputValue('m_desc') || null,
                    footer: interaction.fields.getTextInputValue('m_footer') || null,
                    timestamp: interaction.fields.getTextInputValue('m_timestamp')?.toLowerCase() || 'no',
                    channelId: interaction.fields.getTextInputValue('m_canal'),
                    color: type === 'despedida' ? '#FF6961' : '#FFB6C1'
                };

                await updateGuildData(guildId, data);
                await interaction.reply({ content: `✅ Configuración de **${type}** guardada correctamente.`, ephemeral: true });
            }

            // Webhook Master (Embeds Personalizados)
            if (interaction.customId.startsWith('webhook_super_')) {
                const canalId = interaction.customId.split('_')[2];
                const channel = interaction.guild.channels.cache.get(canalId);

                const embed = new EmbedBuilder()
                    .setTitle(interaction.fields.getTextInputValue('w_title') || null)
                    .setDescription(interaction.fields.getTextInputValue('w_desc'))
                    .setColor(interaction.fields.getTextInputValue('w_color') || '#FFB6C1')
                    .setTimestamp();

                try {
                    const webhook = await channel.createWebhook({ 
                        name: 'Rockstar System', 
                        avatar: client.user.displayAvatarURL() 
                    });
                    await webhook.send({ embeds: [embed] });
                    await webhook.delete();
                    await interaction.reply({ content: '✨ Embed enviado con éxito.', ephemeral: true });
                } catch (e) {
                    await interaction.reply({ content: '❌ Error al procesar el Webhook.', ephemeral: true });
                }
            }
        }
    }
};