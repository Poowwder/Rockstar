const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Archivo automático de funciones del sistema.',
    category: 'info',
    usage: '!!help [comando]',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles.')
        .addStringOption(option => 
            option.setName('comando')
                .setDescription('Ver detalles de un comando específico')
                .setRequired(false)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;

        // --- ✨ EMOJIS ALEATORIOS DEL SERVIDOR ---
        const guildEmojis = guild ? guild.emojis.cache.filter(e => e.available) : null;
        const rnd = () => (guildEmojis && guildEmojis.size > 0) ? guildEmojis.random().toString() : '✨';

        // --- ⚙️ LÓGICA DE BÚSQUEDA ESPECÍFICA ---
        const commands = client.commands;
        const query = isSlash ? input.options.getString('comando') : args?.[0];
        
        if (query) {
            const cmd = commands.get(query.toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(query.toLowerCase()));
            if (cmd) {
                const detailEmbed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle(`${rnd()} ‧₊˚ Comando: ${cmd.name.toUpperCase()} ˚₊‧ ${rnd()}`)
                    .addFields(
                        { name: '✦ Descripción', value: `\`${cmd.description || 'Sin descripción.'}\`` },
                        { name: '✦ Categoría', value: `\`${cmd.category || 'General'}\``, inline: true },
                        { name: '✦ Uso', value: `\`${cmd.usage || '!!' + cmd.name}\``, inline: true }
                    )
                    .setFooter({ text: `Aliases: ${cmd.aliases ? cmd.aliases.join(', ') : 'Ninguno'}` });
                return input.reply({ embeds: [detailEmbed] });
            }
        }

        // --- 📂 SISTEMA DE NAVEGACIÓN (BOTONES) ---
        const rawCategories = [...new Set(commands.map(cmd => cmd.category || 'otros'))];
        const categories = rawCategories.filter(c => c !== 'oculto'); 

        let currentCategory = 'home';

        // Renderizador de Interfaz
        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Rockstar System`, iconURL: user.displayAvatarURL() });

            const rows = [];

            if (currentCategory === 'home') {
                embed.setTitle(`${rnd()} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${rnd()}`)
                    .setDescription(`> *“El conocimiento es poder, y el poder está en las sombras.”*\n\n` +
                                    `He detectado **${commands.size}** archivos en mi núcleo.\n` +
                                    `Selecciona una categoría para explorar su funcionamiento.`);

                // Grupos de 3 botones máximo por fila para que se vea estético y no rompa Discord
                const chunkArray = (arr, size) => arr.length ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [];
                const catChunks = chunkArray(categories, 3);

                catChunks.forEach(chunk => {
                    const row = new ActionRowBuilder();
                    chunk.forEach(cat => {
                        row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`cat_${cat}`)
                                .setLabel(cat.toUpperCase())
                                .setEmoji(rnd()) // Emoji al azar para cada categoría
                                .setStyle(ButtonStyle.Secondary) // Gris oscuro para todos
                        );
                    });
                    rows.push(row);
                });

                // Botón de cerrar aislado abajo
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setEmoji('✖️')
                        .setStyle(ButtonStyle.Danger)
                ));

            } else {
                const filtered = commands.filter(cmd => (cmd.category || 'otros') === currentCategory);

                // Armamos la lista de comandos y la cortamos si es muy larga para evitar el crasheo
                let cmdsString = filtered.map(cmd => 
                    `**${cmd.name}** ⊹ \`${cmd.usage || '!!' + cmd.name}\`\n╰ \`${cmd.description || 'Sin descripción.'}\``
                ).join('\n\n');

                if (cmdsString.length > 4000) {
                    cmdsString = cmdsString.substring(0, 4000) + '...\n\n*Demasiados comandos para mostrar.*';
                }

                embed.setTitle(`${rnd()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${rnd()}`)
                    .setDescription(cmdsString);

                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('go_home')
                        .setLabel('VOLVER')
                        .setEmoji(rnd())
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setEmoji('✖️')
                        .setStyle(ButtonStyle.Danger)
                ));
            }

            return { embeds: [embed], components: rows };
        };

        // --- 🚀 EJECUCIÓN Y RECOLECTOR ---
        const response = await input.reply({ ...generarInterfaz(), fetchReply: true });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button,
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) {
                return i.reply({ content: `❌ Esos archivos no te pertenecen.`, ephemeral: true });
            }

            if (i.customId === 'close') {
                await i.update({ content: `${rnd()} *Archivos cerrados...*`, embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2000);
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                currentCategory = 'home';
            } else if (i.customId.startsWith('cat_')) {
                currentCategory = i.customId.replace('cat_', '');
            }

            try {
                // Actualizamos la interfaz. El try-catch evita que el comando colapse
                await i.update(generarInterfaz());
            } catch (error) {
                console.error("❌ Fallo crítico al actualizar los botones del Help:", error);
            }
        });
        
        collector.on('end', () => {
            // Quitamos los botones cuando el tiempo expira
            response.edit({ components: [] }).catch(() => null);
        });
    }
};
