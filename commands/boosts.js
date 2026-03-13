const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); 
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'boosts',
    description: '🌑 Configura el panel avanzado de mecenas (Boosts).',
    category: 'configuración',
    data: new SlashCommandBuilder()
        .setName('boosts')
        .setDescription('🌑 Configura el mensaje de mejora (Boost) del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: '╰┈➤ ❌ No tienes autoridad para gestionar este dominio.', ephemeral: true });
        }

        // Función para renderizar AMBOS paneles (El Manual y El Control)
        const renderEmbeds = async () => {
            let config = await GuildConfig.findOne({ GuildID: interaction.guild.id });
            const b = config?.BoostConfig || {};
            const currentChannel = b.channelId ? `<#${b.channelId}>` : '`No configurado`';

            // 1. EL MANUAL (Guía de Uso Oscura)
            const guideEmbed = new EmbedBuilder()
                .setTitle('📜 Manual de Mecenas ⊹ Guía de Uso')
                .setColor('#1a1a1a') // Negro Rockstar
                .setDescription('*“Instrucciones para moldear la alfombra roja...”*\n\nUsa los botones inferiores para abrir los formularios. **Si no quieres usar alguna opción, simplemente déjala en blanco.**')
                .addFields(
                    { 
                        name: '✨ Variables Dinámicas (Úsalas en tus textos)', 
                        value: `> \`{user}\` ➔ Menciona al mecenas.\n> \`{server}\` ➔ Nombre de tu servidor.\n> \`{membercount}\` ➔ Total de miembros.\n> \`{boosts}\` ➔ Mejoras actuales del servidor.\n> \`{tier}\` ➔ Nivel de mejora (0, 1, 2, 3).` 
                    },
                    { 
                        name: '🎨 Estética y Formatos', 
                        value: `> **Color Hex:** Usa el formato con \`#\`. Ej: \`#ff73fa\` (Rosa Nitro) o \`#1a1a1a\` (Oscuro).\n> **Thumbnail:** Es la imagen en miniatura (esquina superior derecha).\n> **Imagen:** Es la imagen ancha que decora el fondo del anuncio.\n-# *Nota: Los enlaces de imagen deben terminar en .png, .gif o .jpg*` 
                    }
                );

            // 2. EL PANEL DE CONTROL (Rosa Nitro)
            const panelEmbed = new EmbedBuilder()
                .setTitle('💎 Panel de Control ⊹ Rockstar')
                .setDescription(`> 📍 **Canal de Anuncios:** ${currentChannel}`)
                .addFields(
                    { name: '📝 Textos Actuales', value: `**Mensaje fuera:** ${b.content ? '✅' : '❌'} | **Título:** ${b.title ? '✅' : '❌'} | **Desc:** ${b.description ? '✅' : '❌'}` },
                    { name: '🖼️ Estética Actual', value: `**Color:** ${b.color ? '✅' : '❌'} | **Thumb:** ${b.thumbnail ? '✅' : '❌'} | **Img:** ${b.image ? '✅' : '❌'} | **Footer:** ${b.footer ? '✅' : '❌'} | **Hora:** ${b.timestamp ? '✅' : '❌'}` }
                )
                .setColor('#ff73fa')
                .setThumbnail('https://i.pinimg.com/originals/c6/3e/4d/c63e4dd19fccf4bcbd82ec1e78eb3cc5.gif')
                .setFooter({ text: 'Rockstar ⊹ Nightfall System' });

            return [guideEmbed, panelEmbed]; // Devolvemos los dos Embeds
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_boost_text').setLabel('Textos Principales').setStyle(ButtonStyle.Primary).setEmoji('📝'),
            new ButtonBuilder().setCustomId('btn_boost_media').setLabel('Multimedia & Color').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
            new ButtonBuilder().setCustomId('btn_boost_off').setLabel('Apagar Módulo').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );

        // Enviamos los dos embeds juntos
        const msg = await interaction.reply({ embeds: await renderEmbeds(), components: [row], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 300000 });

        collector.on('collect', async i => {
            let config = await GuildConfig.findOne({ GuildID: interaction.guild.id });
            const b = config?.BoostConfig || {};

            // ❌ APAGAR MÓDULO
            if (i.customId === 'btn_boost_off') {
                await GuildConfig.findOneAndUpdate({ GuildID: interaction.guild.id }, { $unset: { BoostConfig: "" } }, { upsert: true });
                return i.update({ content: '╰┈➤ 🥀 **Módulo de Boosts desactivado.**', embeds: [], components: [] });
            }

            // 📝 MODAL: TEXTOS
            if (i.customId === 'btn_boost_text') {
                const modal = new ModalBuilder().setCustomId('modal_boost_text').setTitle('Textos Principales');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_canal').setLabel('ID del Canal').setPlaceholder('123456789012345678').setStyle(TextInputStyle.Short).setRequired(true).setValue(b.channelId || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_content').setLabel('Mensaje fuera del Embed').setStyle(TextInputStyle.Paragraph).setRequired(false).setValue(b.content || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_title').setLabel('Título del Embed').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.title || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_desc').setLabel('Descripción del Embed').setStyle(TextInputStyle.Paragraph).setRequired(false).setValue(b.description || ''))
                );
                await i.showModal(modal);

                try {
                    const submit = await i.awaitModalSubmit({ filter: m => m.customId === 'modal_boost_text', time: 120000 });
                    await GuildConfig.findOneAndUpdate({ GuildID: interaction.guild.id }, { $set: {
                        'BoostConfig.channelId': submit.fields.getTextInputValue('b_canal'),
                        'BoostConfig.content': submit.fields.getTextInputValue('b_content') || null,
                        'BoostConfig.title': submit.fields.getTextInputValue('b_title') || null,
                        'BoostConfig.description': submit.fields.getTextInputValue('b_desc') || null
                    }}, { upsert: true });

                    await submit.reply({ content: `╰┈➤ ✅ **Textos guardados.**`, ephemeral: true });
                    // Actualizamos ambos embeds para que el panel de abajo marque el ✅
                    await msg.edit({ embeds: await renderEmbeds() });
                } catch (e) { /* Timeout silencioso */ }
            }

            // 🖼️ MODAL: ESTÉTICA Y COLOR
            if (i.customId === 'btn_boost_media') {
                const modal = new ModalBuilder().setCustomId('modal_boost_media').setTitle('Estética y Multimedia');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_color').setLabel('Color Hex (Ej: #ff73fa)').setPlaceholder('#ff73fa').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.color || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_thumb').setLabel('Thumbnail URL (Miniatura)').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.thumbnail || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_img').setLabel('Imagen URL (Grande)').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.image || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_footer').setLabel('Texto del Footer').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.footer || '')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('b_time').setLabel('¿Mostrar la hora? (si/no)').setStyle(TextInputStyle.Short).setRequired(false).setValue(b.timestamp ? 'si' : 'no'))
                );
                await i.showModal(modal);

                try {
                    const submit = await i.awaitModalSubmit({ filter: m => m.customId === 'modal_boost_media', time: 120000 });
                    await GuildConfig.findOneAndUpdate({ GuildID: interaction.guild.id }, { $set: {
                        'BoostConfig.color': submit.fields.getTextInputValue('b_color') || null,
                        'BoostConfig.thumbnail': submit.fields.getTextInputValue('b_thumb') || null,
                        'BoostConfig.image': submit.fields.getTextInputValue('b_img') || null,
                        'BoostConfig.footer': submit.fields.getTextInputValue('b_footer') || null,
                        'BoostConfig.timestamp': submit.fields.getTextInputValue('b_time').toLowerCase().trim() === 'si'
                    }}, { upsert: true });

                    await submit.reply({ content: `╰┈➤ 🎨 **Estética guardada.**`, ephemeral: true });
                    // Actualizamos ambos embeds
                    await msg.edit({ embeds: await renderEmbeds() });
                } catch (e) { /* Timeout silencioso */ }
            }
        });
    }
};
