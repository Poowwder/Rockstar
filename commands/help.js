const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Manual de operaciones y lista de comandos del sistema.',
    category: 'información',
    usage: '!!help [comando]',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles.')
        .addStringOption(option => 
            option.setName('comando')
                .setDescription('Ver funcionamiento detallado de un comando')
                .setRequired(false)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;

        // --- ✨ MOTOR DE EMOJIS INTELIGENTE ---
        const getE = (isDM = false) => {
            const source = (isDM || !guild) ? client.emojis.cache : guild.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '✨';
        };

        // --- 📂 FILTRADO DE COMANDOS ---
        const allCommands = [...new Map(client.commands.map(cmd => [cmd.name, cmd])).values()];
        const categories = [...new Set(allCommands.map(cmd => cmd.category || 'general'))]
            .filter(cat => cat !== 'oculto');

        const query = isSlash ? input.options.getString('comando') : args?.[0];

        // --- 🔍 1. MODO MANUAL (Slash: Ephemeral / Prefix: DM) ---
        if (query) {
            const cmd = allCommands.find(c => c.name === query.toLowerCase() || (c.aliases && c.aliases.includes(query.toLowerCase())));
            
            if (cmd) {
                const isDM = !isSlash; 
                let finalDesc = cmd.description;
                if (cmd.name === 'work') finalDesc = 'Ficha tu entrada y cumple con tu jornada laboral para recibir flores.';

                const detailEmbed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle(`${getE(isDM)} Manual: ${cmd.name.toUpperCase()} ${getE(isDM)}`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setDescription(
                        `${getE(isDM)} **¿Para qué sirve?**\n> ${finalDesc || 'Sin descripción disponible.'}\n\n` +
                        `${getE(isDM)} **Funcionamiento & Uso:**\n> Se ejecuta usando el comando \`${cmd.usage || '!!' + cmd.name}\`.\n` +
                        `> Pertenece a la sección de **${cmd.category?.toUpperCase() || 'GENERAL'}**.\n\n` +
                        `${getE(isDM)} *Explora más comandos usando el menú principal del sistema.*`
                    )
                    .addFields(
                        { name: `${getE(isDM)} Aliases`, value: `\`${cmd.aliases ? cmd.aliases.join(', ') : 'Ninguno'}\``, inline: true },
                        { name: `${getE(isDM)} Categoría`, value: `\`${cmd.category || 'General'}\``, inline: true }
                    )
                    .setFooter({ text: `Rockstar Nova ⊹ Manual Detallado`, iconURL: user.displayAvatarURL() });

                if (isSlash) {
                    return input.reply({ embeds: [detailEmbed], ephemeral: true });
                } else {
                    try {
                        await user.send({ embeds: [detailEmbed] });
                        return input.reply(`╰┈➤ ${getE()} **${user.username}**, he enviado el manual detallado a tus mensajes directos.`);
                    } catch (e) {
                        return input.reply(`╰┈➤ ❌ **${user.username}**, no pude enviarte el manual. ¿Tienes los DMs cerrados?`);
                    }
                }
            }
        }

        // --- 📑 2. SISTEMA DE NAVEGACIÓN Y COLUMNAS ---
        let page = 0;
        const pages = ['home'];

        // Lógica automática: Divide las categorías que tengan más de 10 comandos en varias páginas
        categories.forEach(cat => {
            const catCmds = allCommands.filter(c => (c.category || 'general') === cat);
            for (let i = 0; i < catCmds.length; i += 10) {
                pages.push({
                    cat: cat,
                    cmds: catCmds.slice(i, i + 10),
                    current: Math.floor(i / 10) + 1,
                    total: Math.ceil(catCmds.length / 10)
                });
            }
        });

        const generarEmbed = (p) => {
            const embed = new EmbedBuilder().setColor('#1a1a1a');
            const pageData = pages[p];

            if (pageData === 'home') {
                embed.setTitle(`${getE()} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${getE()}`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setDescription(
                        `${getE()} *“El conocimiento es poder, y el poder está en las sombras.”*\n\n` +
                        `${getE()} He detectado **${allCommands.length}** funciones en mi núcleo.\n` +
                        `${getE()} Navega por las secciones usando los botones inferiores.\n\n` +
                        `${getE()} **Tip:** Usa \`!!help [comando]\` para un manual en tu DM.`
                    );
            } else {
                // Título dinámico si hay partes (ej: Sección: ACCIÓN (Pt. 1))
                const extraTitle = pageData.total > 1 ? ` (Pt. ${pageData.current})` : '';
                
                embed.setTitle(`${getE()} Sección: ${pageData.cat.toUpperCase()}${extraTitle} ${getE()}`)
                    .setDescription(`${getE()} **Comandos de esta categoría:**\n*Los comandos están distribuidos en columnas para tu comodidad.*`)
                    .setFooter({ text: `Página ${p} de ${pages.length - 1} ⊹ ${user.username}`, iconURL: user.displayAvatarURL() });

                // Esto crea las columnas automáticamente usando "inline: true"
                const fields = pageData.cmds.map(c => {
                    let d = (c.name === 'work') ? 'Ficha tu entrada y cumple con tu jornada laboral.' : c.description;
                    return {
                        name: `✦ ${c.name}`,
                        value: `\`${d || 'Sin descripción.'}\``,
                        inline: true 
                    };
                });

                embed.addFields(fields);
            }
            return embed;
        };

        const generarBotones = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji(getE()),
                new ButtonBuilder().setCustomId('prev').setLabel('Atrás').setStyle(ButtonStyle.Primary).setEmoji(getE()),
                new ButtonBuilder().setCustomId('next').setLabel('Adelante').setStyle(ButtonStyle.Primary).setEmoji(getE()),
                new ButtonBuilder().setCustomId('exit').setLabel('Salir').setStyle(ButtonStyle.Danger).setEmoji('✖️')
            );
        };

        const msg = await input.reply({ 
            embeds: [generarEmbed(0)], 
            components: [generarBotones()], 
            fetchReply: true 
        });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: '❌ No puedes usar este menú.', ephemeral: true });

            if (i.customId === 'exit') {
                await i.update({ content: `${getE()} *Archivos cerrados con éxito...*`, embeds: [], components: [] });
                return setTimeout(() => msg.delete().catch(() => {}), 2000);
            }

            if (i.customId === 'home') page = 0;
            if (i.customId === 'prev') page = page > 0 ? page - 1 : pages.length - 1;
            if (i.customId === 'next') page = page < pages.length - 1 ? page + 1 : 0;

            await i.update({ embeds: [generarEmbed(page)], components: [generarBotones()] });
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
    }
};
