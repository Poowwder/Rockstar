const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Panel de ayuda con nombres en categorías y descripción en secciones.',
    category: 'info',
    usage: '!!help [comando]',
    async execute(message, args) {
        const { commands } = message.client;
        const guildEmojis = message.guild.emojis.cache.filter(e => e.available);

        // --- ✨ FUNCIÓN EMOJI LOCAL ---
        const getLocalEmoji = () => {
            if (guildEmojis.size === 0) return { toString: '', name: '' };
            const picked = guildEmojis.random();
            return { toString: picked.toString(), name: picked.name };
        };

        const pastelColors = {
            economia: '#FDFD96', niveles: '#FFB7C5', diversion: '#A2D2FF',
            info: '#B5EAD7', categorias: '#E0BBE4', default: '#FFDAC1'
        };

        // --- 📂 1. SECCIÓN CATEGORÍAS (SOLO NOMBRES) ---
        const getAllNames = () => {
            const names = commands.map(cmd => `\`!!${cmd.name}\``);
            const pageSize = 15; // Caben muchos más porque no hay descripción
            const chunks = [];
            for (let i = 0; i < names.length; i += pageSize) {
                chunks.push(names.slice(i, i + pageSize).join(' '));
            }
            return chunks;
        };

        const chunksCategorias = getAllNames();
        let currentPage = 0;

        // --- 🛠️ COMPONENTES ---
        const getMenu = () => new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('Selecciona una sección...')
                .addOptions([
                    { label: 'Categorías (Todos)', value: 'categorias', emoji: '📂' },
                    { label: 'Economía', value: 'economia', emoji: '💰' },
                    { label: 'Niveles', value: 'niveles', emoji: '🎀' },
                    { label: 'Diversión', value: 'diversion', emoji: '🎮' },
                    { label: 'Utilidad', value: 'info', emoji: '⚙️' },
                ])
        );

        // --- 🖼️ FUNCIÓN RENDERIZAR ---
        const createHelpEmbed = (title, description, color, emojiV, emojiC) => {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${description}\n\n---`)
                .setColor(color);

            if (emojiV.name || emojiC.name) {
                let guide = `*Guía de botones:*\n`;
                if (emojiV.name) guide += `${emojiV.toString} \`:${emojiV.name}:\` **Volver**\n`;
                if (emojiC.name) guide += `${emojiC.toString} \`:${emojiC.name}:\` **Cerrar**`;
                embed.addFields({ name: '⁠', value: guide });
            }
            return embed;
        };

        // --- 🚀 INICIO ---
        const mainEmbed = new EmbedBuilder()
            .setTitle(`${getLocalEmoji().toString} Panel de Ayuda - Rockstar`)
            .setDescription('Selecciona una opción en el menú.')
            .setColor(pastelColors.default);

        const response = await message.reply({ embeds: [mainEmbed], components: [getMenu()] });
        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: 'No puedes usar esto.', ephemeral: true });

            const emojiV = getLocalEmoji();
            const emojiC = getLocalEmoji();

            if (i.isStringSelectMenu()) {
                const choice = i.values[0];
                const color = pastelColors[choice] || pastelColors.default;

                if (choice === 'categorias') {
                    currentPage = 0;
                    const btnRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                        new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(chunksCategorias.length <= 1),
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString || null).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString || null).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📂 Todos los Comandos`, chunksCategorias[0], pastelColors.categorias, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [btnRow] });

                } else {
                    // SECCIONES INDIVIDUALES CON DESCRIPCIÓN
                    const catCommands = commands.filter(cmd => cmd.category === choice)
                        .map(cmd => `${getLocalEmoji().toString} **!!${cmd.name}**\n╰ ${cmd.description}`)
                        .join('\n\n') || 'No hay comandos aquí.';

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString || null).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString || null).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📍 Sección: ${choice.toUpperCase()}`, catCommands, color, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [row] });
                }
            }

            if (i.isButton()) {
                if (i.customId === 'close') {
                    await i.update({ content: '🌸 Menú cerrado.', embeds: [], components: [] });
                    return collector.stop();
                }
                if (i.customId === 'go_home') {
                    await i.update({ embeds: [mainEmbed], components: [getMenu()] });
                }
                if (i.customId === 'next' || i.customId === 'prev') {
                    currentPage = i.customId === 'next' ? currentPage + 1 : currentPage - 1;
                    const navRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
                        new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === chunksCategorias.length - 1),
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString || null).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString || null).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📂 Comandos (Pág. ${currentPage + 1})`, chunksCategorias[currentPage], pastelColors.categorias, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [navRow] });
                }
            }
        });
    }
};