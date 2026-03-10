const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Guía estética de comandos.',
    category: 'info',
    aliases: ['ayuda', 'h'],
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Guía estética de comandos.'),

    async execute(input) {
        const isSlash = input.type !== undefined;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const commands = input.client.commands;

        const getRndEmoji = () => {
            const emojis = guild.emojis.cache.filter(e => e.available);
            return emojis.size > 0 ? emojis.random().toString() : '✨';
        };

        let currentCategory = 'home';
        let currentPage = 0;
        const itemsPerPage = 5;
        const categories = ['economia', 'niveles', 'diversion', 'action', 'reaction', 'info'];

        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Sesión de ayuda`, iconURL: user.displayAvatarURL() });

            const rows = [];
            const rowNav = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${getRndEmoji()}`)
                    .setDescription(`> *“En las sombras también nace la magia...”* ⊹\n\nActualmente hay **${commands.size}** funciones disponibles.\nSelecciona una sección para explorar.`);

                const row1 = new ActionRowBuilder();
                const row2 = new ActionRowBuilder();
                categories.slice(0, 3).forEach(cat => row1.addComponents(new ButtonBuilder().setCustomId(`cat_${cat}`).setLabel(cat.toUpperCase()).setStyle(ButtonStyle.Secondary).setEmoji(getRndEmoji())));
                categories.slice(3, 6).forEach(cat => row2.addComponents(new ButtonBuilder().setCustomId(`cat_${cat}`).setLabel(cat.toUpperCase()).setStyle(ButtonStyle.Secondary).setEmoji(getRndEmoji())));
                rowNav.addComponents(new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger).setEmoji('✖️'));
                rows.push(row1, row2, rowNav);
            } else {
                const filtered = Array.from(commands.filter(cmd => cmd.category === currentCategory).values());
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const cmdsToShow = filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                embed.setTitle(`${getRndEmoji()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`)
                    .setDescription(`*Explorando los comandos de esta categoría...* ✦\n\n` + (cmdsToShow.length > 0 ? cmdsToShow.map(cmd => `${getRndEmoji()} **!!${cmd.name}**\n╰ \`${cmd.description || 'Sin descripción.'}\``).join('\n\n') : "🥀 *Nada por aquí todavía...*"));

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('prev').setLabel('Atrás').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('next').setLabel('Adelante').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= totalPages - 1),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowNav);
            }
            return { embeds: [embed], components: rows };
        };

        const response = isSlash ? await input.reply({ ...generarInterfaz(), fetchReply: true }) : await input.reply(generarInterfaz());
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: '⟢ Estas sombras no te pertenecen.', ephemeral: true });
            if (i.customId === 'close') { await i.message.delete().catch(() => null); return collector.stop(); }

            if (i.customId === 'go_home') { currentCategory = 'home'; currentPage = 0; }
            else if (i.customId.startsWith('cat_')) { currentCategory = i.customId.replace('cat_', ''); currentPage = 0; }
            else if (i.customId === 'next') { currentPage++; }
            else if (i.customId === 'prev') { currentPage--; }

            await i.update(generarInterfaz());
        });

        collector.on('end', () => { if (!isSlash || response.editable) response.edit({ components: [] }).catch(() => null); });
    }
};
