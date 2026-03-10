const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Panel de ayuda estético con guía de emojis dinámicos y botones grises.',
    category: 'info',
    usage: '!!help [comando]',
    async execute(message, args) {
        const { commands, emojis } = message.client;

        // --- ✨ FUNCIÓN PARA OBTENER OBJETO DE EMOJI ALEATORIO ---
        const getRandomEmoji = () => {
            const emojiList = emojis.cache.filter(e => e.available).map(e => e);
            if (emojiList.length === 0) return { toString: '🌸', name: 'flor' };
            const picked = emojiList[Math.floor(Math.random() * emojiList.length)];
            return { 
                toString: picked.toString(), 
                name: picked.name 
            };
        };

        // --- 🎨 MAPA DE COLORES PASTELES ---
        const pastelColors = {
            economia: '#FDFD96', // Amarillo
            niveles: '#FFB7C5',  // Rosa
            diversion: '#A2D2FF', // Azul
            info: '#B5EAD7',      // Menta
            utilidad: '#B5EAD7',
            categorias: '#E0BBE4', // Lavanda
            default: '#FFDAC1'    // Melocotón
        };

        // --- 📖 AYUDA ESPECÍFICA (!!help comando) ---
        if (args[0]) {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            if (!command) return message.reply({ content: `❌ El comando \`${name}\` no existe.`, ephemeral: true });

            const categoryColor = pastelColors[command.category?.toLowerCase()] || pastelColors.default;
            const rndEmoji = getRandomEmoji();

            const embedHelp = new EmbedBuilder()
                .setTitle(`${rndEmoji.toString} Ayuda: !!${command.name}`)
                .setDescription(`${command.description || 'Sin descripción.'}`)
                .addFields(
                    { name: '✨ Uso', value: `\`${command.usage || `!!${command.name}`}\``, inline: true },
                    { name: '📂 Categoría', value: `\`${command.category || 'General'}\``, inline: true }
                )
                .setColor(categoryColor);

            return message.reply({ embeds: [embedHelp], ephemeral: true });
        }

        // --- 📂 LÓGICA DE MAPEO AUTOMÁTICO ---
        const getCommandsList = () => commands.map(cmd => `${getRandomEmoji().toString} **!!${cmd.name}**\n╰ ${cmd.description}`);
        const pageSize = 5;
        let allCommandsList = getCommandsList();
        const pagesCount = Math.ceil(allCommandsList.length / pageSize);
        let currentPage = 0;

        // --- 🛠️ COMPONENTES ---
        const getMenu = () => new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('Selecciona una categoría...')
                .addOptions([
                    { label: 'Categorías (Todos)', value: 'categorias', emoji: '📂' },
                    { label: 'Economía', value: 'economia', emoji: '💰' },
                    { label: 'Niveles', value: 'niveles', emoji: '🎀' },
                    { label: 'Diversión', value: 'diversion', emoji: '🎮' },
                    { label: 'Utilidad', value: 'info', emoji: '⚙️' },
                ])
        );

        // --- 🖼️ FUNCIÓN PARA RENDERIZAR EL EMBED CON GUÍA DE EMOJIS ---
        const createHelpEmbed = (title, description, color, emojiVolver, emojiCerrar) => {
            return new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${description}\n\n---`)
                .setColor(color)
                .addFields({
                    name: '⁠', 
                    value: `*Guía de botones:*\n${emojiVolver.toString} \`:${emojiVolver.name}:\` **Volver**\n${emojiCerrar.toString} \`:${emojiCerrar.name}:\` **Cerrar**`
                });
        };

        // --- 🚀 INICIO ---
        const mainEmbed = new EmbedBuilder()
            .setTitle(`${getRandomEmoji().toString} Panel de Ayuda - Rockstar`)
            .setDescription('¡Hola! Selecciona una opción en el menú para empezar.\n\n*Usa `!!help [comando]` para ayuda específica.*')
            .setColor(pastelColors.default);

        const response = await message.reply({ embeds: [mainEmbed], components: [getMenu()] });
        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: 'No puedes usar este menú.', ephemeral: true });

            const emojiV = getRandomEmoji();
            const emojiC = getRandomEmoji();

            if (i.isStringSelectMenu()) {
                const choice = i.values[0];
                const color = pastelColors[choice] || pastelColors.default;

                if (choice === 'categorias') {
                    currentPage = 0;
                    allCommandsList = getCommandsList(); 
                    const display = allCommandsList.slice(0, pageSize).join('\n\n');
                    
                    const btnRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                        new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(pagesCount <= 1),
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📂 Todos los Comandos`, display, pastelColors.categorias, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [btnRow] });
                } else {
                    const catCommands = commands.filter(cmd => cmd.category === choice)
                        .map(cmd => `${getRandomEmoji().toString} **!!${cmd.name}**\n╰ ${cmd.description}`)
                        .join('\n\n') || 'No hay comandos en esta categoría.';

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📍 Sección: ${choice.toUpperCase()}`, catCommands, color, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [row] });
                }
            }

            if (i.isButton()) {
                if (i.customId === 'close') {
                    await i.update({ content: `${getRandomEmoji().toString} Menú cerrado.`, embeds: [], components: [] });
                    return collector.stop();
                }

                if (i.customId === 'go_home') {
                    await i.update({ embeds: [mainEmbed], components: [getMenu()] });
                }

                if (i.customId === 'next' || i.customId === 'prev') {
                    currentPage = i.customId === 'next' ? currentPage + 1 : currentPage - 1;
                    const start = currentPage * pageSize;
                    const display = allCommandsList.slice(start, start + pageSize).join('\n\n');
                    
                    const navRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
                        new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === pagesCount - 1),
                        new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji(emojiC.toString).setStyle(ButtonStyle.Danger)
                    );

                    const embed = createHelpEmbed(`📂 Comandos (Pág. ${currentPage + 1}/${pagesCount})`, display, pastelColors.categorias, emojiV, emojiC);
                    await i.update({ embeds: [embed], components: [navRow] });
                }
            }
        });
    }
};