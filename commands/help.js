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
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;

        // --- ⚙️ Lógica de Detección Automática ---
        const commands = client.commands;
        
        // Si el usuario pide ayuda de un comando específico (!!help mine)
        const query = isSlash ? input.options.getString('comando') : args[0];
        if (query) {
            const cmd = commands.get(query.toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(query.toLowerCase()));
            if (cmd) {
                const detailEmbed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle(`⟢ Comando: ${cmd.name.toUpperCase()} ⟣`)
                    .addFields(
                        { name: '✦ Descripción', value: `\`${cmd.description || 'Sin descripción.'}\`` },
                        { name: '✦ Categoría', value: `\`${cmd.category || 'General'}\``, inline: true },
                        { name: '✦ Uso', value: `\`${cmd.usage || '!!' + cmd.name}\``, inline: true }
                    )
                    .setFooter({ text: `Aliases: ${cmd.aliases ? cmd.aliases.join(', ') : 'Ninguno'}` });
                return isSlash ? input.reply({ embeds: [detailEmbed] }) : input.reply({ embeds: [detailEmbed] });
            }
        }

        // --- 📂 Generar Categorías Automáticamente ---
        // Esto filtra las categorías únicas de todos los comandos cargados en el bot
        const rawCategories = [...new Set(commands.map(cmd => cmd.category || 'otros'))];
        const categories = rawCategories.filter(c => c !== 'oculto'); // Por si quieres ocultar comandos de admin

        let currentCategory = 'home';

        const getEmoji = () => {
            if (!guild) return '✨';
            const emojis = guild.emojis.cache.filter(e => e.available);
            return emojis.size > 0 ? emojis.random().toString() : '✨';
        };

        const generarInterfaz = () => {
            const emoji = getEmoji();
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Rockstar System`, iconURL: user.displayAvatarURL() });

            const rows = [];

            if (currentCategory === 'home') {
                embed.setTitle(`${emoji} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${emoji}`)
                    .setDescription(`> *“Todo lo que buscas está escrito en las sombras.”*\n\n` +
                                   `He detectado **${commands.size}** comandos en mi núcleo.\n` +
                                   `Selecciona una categoría para explorar su funcionamiento.`);

                // Generar botones de categorías dinámicamente
                let row = new ActionRowBuilder();
                categories.forEach((cat, index) => {
                    if (index > 0 && index % 3 === 0) {
                        rows.push(row);
                        row = new ActionRowBuilder();
                    }
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cat_${cat}`)
                            .setLabel(cat.toUpperCase())
                            .setStyle(ButtonStyle.Secondary)
                    );
                });
                rows.push(row);

                const rowClose = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('CERRAR').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowClose);
            } else {
                const filtered = commands.filter(cmd => (cmd.category || 'otros') === currentCategory);

                embed.setTitle(`${emoji} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹`)
                    .setDescription(filtered.map(cmd => 
                        `**!!${cmd.name}**\n╰ *Uso:* \`${cmd.usage || '!!' + cmd.name}\`\n╰ \`${cmd.description || 'Sin descripción.'}\``
                    ).join('\n\n'));

                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('INICIO').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('close').setLabel('CERRAR').setStyle(ButtonStyle.Danger)
                ));
            }
            return { embeds: [embed], components: rows };
        };

        const response = isSlash 
            ? await input.reply({ ...generarInterfaz(), fetchReply: true }) 
            : await input.reply(generarInterfaz());

        const collector = response.createMessageComponentCollector({ 
            filter: i => i.user.id === user.id, 
            time: 300000 
        });

        collector.on('collect', async i => {
            if (i.customId === 'close') {
                await i.message.delete().catch(() => null);
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                currentCategory = 'home';
            } else if (i.customId.startsWith('cat_')) {
                currentCategory = i.customId.replace('cat_', '');
            }

            await i.update(generarInterfaz()).catch(() => null);
        });

        collector.on('end', () => {
            if (!isSlash) response.edit({ components: [] }).catch(() => null);
        });
    }
};
