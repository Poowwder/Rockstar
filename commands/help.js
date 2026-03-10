const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Muestra la lista de comandos del bot.',
    async execute(message, args) {
        
        // --- 📂 CONFIGURACIÓN DE CONTENIDO ---
        const info = {
            main: {
                title: '🌸 Panel de Categorías - Rockstar',
                description: 'Bienvenido al menú de ayuda. Haz clic en los botones de abajo para ver los comandos de cada sección.\n\n' +
                             '💰 **Economía**\n' +
                             '🎀 **Niveles**\n' +
                             '🎮 **Diversión**\n' +
                             '⚙️ **Utilidad**',
                color: '#ffb7c5'
            },
            economia: {
                title: '💰 Categoría: Economía',
                description: 'Aquí encontrarás todo lo necesario para gestionar tus monedas y progresar financieramente en el servidor.',
                commands: '`!!work`, `!!bal`, `!!daily`, `!!shop`, `!!pay`',
                color: '#f1c40f'
            },
            niveles: {
                title: '🎀 Categoría: Niveles',
                description: 'Comandos para revisar tu experiencia, rango y el ranking global de usuarios activos.',
                commands: '`!!rank`, `!!leaderboard`, `!!xp-info`',
                color: '#e91e63'
            },
            diversion: {
                title: '🎮 Categoría: Diversión',
                description: '¡Pásalo bien con estos comandos! Roleplay, juegos y acciones para interactuar con otros.',
                commands: '`!!kiss`, `!!hug`, `!!slap`, `!!dice`, `!!8ball`',
                color: '#3498db'
            },
            utilidad: {
                title: '⚙️ Categoría: Utilidad',
                description: 'Información técnica, ayuda del sistema y herramientas útiles para el día a día.',
                commands: '`!!ping`, `!!userinfo`, `!!serverinfo`, `!!avatar`',
                color: '#95a5a6'
            }
        };

        // --- 🔘 FILAS DE BOTONES ---
        // Fila 1: Solo para el menú principal (Categorías)
        const rowMain = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('go_economia').setLabel('Economía').setEmoji('💰').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('go_niveles').setLabel('Niveles').setEmoji('🎀').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('go_diversion').setLabel('Diversión').setEmoji('🎮').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('go_utilidad').setLabel('Utilidad').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
        );

        // Fila 2: Solo el botón de Cerrar (y Volver si quisieras, pero pondremos solo Cerrar)
        const rowClose = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_help').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger)
        );

        // --- 🖼️ MENSAJE INICIAL ---
        const mainEmbed = new EmbedBuilder()
            .setTitle(info.main.title)
            .setDescription(info.main.description)
            .setColor(info.main.color)
            .setThumbnail(message.client.user.displayAvatarURL());

        const response = await message.reply({ 
            embeds: [mainEmbed], 
            components: [rowMain, rowClose] 
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ Solo quien pidió la ayuda puede usar los botones.', ephemeral: true });
            }

            if (i.customId === 'close_help') {
                await i.update({ content: '🌸 Menú de ayuda cerrado.', embeds: [], components: [] });
                return collector.stop();
            }

            // Identificar qué categoría eligió
            const selected = i.customId.split('_')[1];
            const data = info[selected];

            const categoryEmbed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(`${data.description}\n\n**Comandos:**\n${data.commands}`)
                .setColor(data.color)
                .setFooter({ text: 'Usa !! antes de cada comando' });

            // AQUÍ ESTÁ EL CAMBIO: Al entrar a una categoría, quitamos la fila de navegación (rowMain)
            // y dejamos solamente el botón de Cerrar (rowClose).
            await i.update({ 
                embeds: [categoryEmbed], 
                components: [rowClose] 
            });
        });

        collector.on('end', () => {
            if (response.editable) {
                response.edit({ components: [] }).catch(() => {});
            }
        });
    },
};