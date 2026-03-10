const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Muestra la lista de comandos.',
    category: 'info',
    async execute(message, args) {
        
        // --- FILAS DE BOTONES ---
        const rowMain = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cat_economia').setLabel('Economía').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('cat_niveles').setLabel('Niveles').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('cat_diversion').setLabel('Diversión').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('cat_utilidad').setLabel('Utilidad').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('close_help').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
        );

        const rowOnlyClose = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_help').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
        );

        // --- CONTENIDO ---
        const pages = {
            main: {
                title: '📂 Categorías del Bot',
                description: 'Selecciona una categoría para ver sus comandos:\n\n💰 **Economía**\n🎀 **Niveles**\n🎮 **Diversión**\n⚙️ **Utilidad**',
                components: [rowMain]
            },
            economia: {
                title: '💰 Categoría: Economía',
                description: 'Comandos para gestionar tu dinero:\n\n`!!work` - Trabaja por monedas.\n`!!bal` - Mira tu dinero.\n`!!daily` - Tu bono diario.',
                components: [rowOnlyClose] // SOLO CERRAR
            },
            niveles: {
                title: '🎀 Categoría: Niveles',
                description: 'Tu progreso en el servidor:\n\n`!!rank` - Tu nivel actual.\n`!!leaderboard` - Los mejores del servidor.',
                components: [rowOnlyClose] // SOLO CERRAR
            },
            diversion: {
                title: '🎮 Categoría: Diversión',
                description: 'Para pasar el rato:\n\n`!!kiss` - Un beso.\n`!!hug` - Un abrazo.\n`!!slap` - Una bofetada.',
                components: [rowOnlyClose] // SOLO CERRAR
            },
            utilidad: {
                title: '⚙️ Categoría: Utilidad',
                description: 'Información y herramientas:\n\n`!!bot-info` - Stats del bot.\n`!!invite` - Link de invitación.\n`!!setup-full` - Configura el servidor.',
                components: [rowOnlyClose] // SOLO CERRAR
            }
        };

        const embed = new EmbedBuilder()
            .setTitle(pages.main.title)
            .setDescription(pages.main.description)
            .setColor('#ffb7c5');

        const response = await message.reply({ embeds: [embed], components: pages.main.components });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: 'No puedes usar esto.', ephemeral: true });

            if (i.customId === 'close_help') {
                await i.update({ content: 'Menú cerrado.', embeds: [], components: [] });
                return collector.stop();
            }

            const cat = i.customId.replace('cat_', '');
            const page = pages[cat];

            const newEmbed = new EmbedBuilder()
                .setTitle(page.title)
                .setDescription(page.description)
                .setColor('#ffb7c5');

            await i.update({ embeds: [newEmbed], components: page.components });
        });
    }
};