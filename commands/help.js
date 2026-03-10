
const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Guía estética de comandos.',
    category: 'info',
    aliases: ['ayuda', 'h'],
    usage: '!!help',
    async execute(message, args) {
        const { commands } = message.client;
        const guild = message.guild;

        // --- ⟢ Lógica de Emojis del Servidor ⟢ ---
        const localEmojis = guild.emojis.cache.filter(e => e.available);
        const getRndEmoji = () => localEmojis.size > 0 ? localEmojis.random().toString() : '';

        // --- ✦ Configuración de Navegación ✦ ---
        let currentCategory = 'home';
        let currentPage = 0;
        const itemsPerPage = 5;
        const categories = ['economia', 'niveles', 'diversion', 'action', 'reaction', 'info'];

        // --- ⊹ Constructor de Interfaz Aesthetic ⊹ ---
        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a') // Un negro más profundo para el aesthetic dark
                .setFooter({ 
                    text: `✦ ${message.author.username} ⊹ Sesión de ayuda`, 
                    iconURL: message.author.displayAvatarURL() 
                });

            const rowCategories1 = new ActionRowBuilder();
            const rowCategories2 = new ActionRowBuilder();
            const rowNav = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${getRndEmoji()}`.trim())
                    .setDescription(
                        `> *“En las sombras también nace la magia...”* ⊹\n\n` +
                        `Actualmente hay **${commands.size}** funciones disponibles.\n` +
                        `Selecciona una sección para explorar.`
                    );

                // Botones de categorías (Grises)
                categories.slice(0, 3).forEach(cat => {
                    const btn = new ButtonBuilder().setCustomId(`cat_${cat}`).setLabel(cat.toUpperCase()).setStyle(ButtonStyle.Secondary);
                    const em = getRndEmoji();
                    if (em) btn.setEmoji(em);
                    rowCategories1.addComponents(btn);
                });
                categories.slice(3, 6).forEach(cat => {
                    const btn = new ButtonBuilder().setCustomId(`cat_${cat}`).setLabel(cat.toUpperCase()).setStyle(ButtonStyle.Secondary);
                    const em = getRndEmoji();
                    if (em) btn.setEmoji(em);
                    rowCategories2.addComponents(btn);
                });

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger).setEmoji('⟢')
                );

                return { embeds: [embed], components: [rowCategories1, rowCategories2, rowNav] };

            } else {
                const filtered = commands.filter(cmd => cmd.category === currentCategory).map(cmd => cmd);
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const start = currentPage * itemsPerPage;
                const cmdsToShow = filtered.slice(start, start + itemsPerPage);

                embed.setTitle(`${getRndEmoji()} ⊹ Section: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`.trim())
                    .setDescription(
                        `*Explorando los comandos de esta categoría...* ✦\n\n` +
                        (cmdsToShow.length > 0 
                            ? cmdsToShow.map(cmd => `${getRndEmoji()} **!!${cmd.name}**\n╰ \`${cmd.description || 'Sin descripción.'}\``).join('\n\n')
                            : "🥀 *Nada por aquí todavía...*")
                    );

                // Navegación: Atrás, Inicio, Adelante, Cerrar
                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('prev').setLabel('Atrás').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('next').setLabel('Adelante').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= totalPages - 1),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );

                return { embeds: [embed], components: [rowNav] };
            }
        };

        const response = await message.reply(generarInterfaz());

        // --- ✧ Colector de Interacciones ✧ ---
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button,
            time: 300000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ 
                    content: '⟢ Solo quien invocó este menú puede navegar en él.', 
                    ephemeral: true 
                });
            }

            if (i.customId === 'close') {
                await i.message.delete().catch(() => null);
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                currentCategory = 'home';
                currentPage = 0;
            } else if (i.customId.startsWith('cat_')) {
                currentCategory = i.customId.replace('cat_', '');
                currentPage = 0;
            } else if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'prev') {
                currentPage--;
            }

            await i.update(generarInterfaz());
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user') {
                response.edit({ components: [] }).catch(() => null);
            }
        });
    }
};
