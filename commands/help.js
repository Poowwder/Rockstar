const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');
const emojis = require('../utils/emojiHelper.js'); // Tus emojis

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

        // --- ⚙️ LÓGICA DE BÚSQUEDA ESPECÍFICA ---
        const commands = client.commands;
        const query = isSlash ? input.options.getString('comando') : args?.[0];
        
        if (query) {
            const cmd = commands.get(query.toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(query.toLowerCase()));
            if (cmd) {
                const detailEmbed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle(`${emojis.star} ‧₊˚ Comando: ${cmd.name.toUpperCase()} ˚₊‧ ${emojis.star}`)
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
        // Extraemos las categorías únicas y descartamos la "oculta"
        const rawCategories = [...new Set(commands.map(cmd => cmd.category || 'otros'))];
        const categories = rawCategories.filter(c => c !== 'oculto'); 

        let currentCategory = 'home';

        // Función para renderizar el menú en vivo
        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Rockstar System`, iconURL: user.displayAvatarURL() });

            const rows = [];

            if (currentCategory === 'home') {
                embed.setTitle(`${emojis.star} ⟢ ₊˚ Rockstar Archive ˚₊ ⟣ ${emojis.star}`)
                    .setDescription(`> *“Todo lo que buscas está escrito en las sombras.”*\n\n` +
                                    `He detectado **${commands.size}** comandos en mi núcleo.\n` +
                                    `Selecciona una categoría para explorar su funcionamiento.`);

                // Función para dividir los botones en grupos de 3 (Discord solo acepta hasta 5 por fila)
                const chunkArray = (arr, size) => arr.length ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [];
                const catChunks = chunkArray(categories, 3);

                catChunks.forEach(chunk => {
                    const row = new ActionRowBuilder();
                    chunk.forEach(cat => {
                        row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`cat_${cat}`)
                                .setLabel(cat.toUpperCase())
                                .setEmoji(emojis.pinkbow || '🎀')
                                .setStyle(ButtonStyle.Secondary)
                        );
                    });
                    rows.push(row);
                });

                // Fila final con el botón de cerrar
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setEmoji('✖️')
                        .setStyle(ButtonStyle.Danger)
                ));

            } else {
                const filtered = commands.filter(cmd => (cmd.category || 'otros') === currentCategory);

                embed.setTitle(`${emojis.pinkstars} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹`)
                    .setDescription(filtered.map(cmd => 
                        `**!!${cmd.name}**\n╰ *Uso:* \`${cmd.usage || '!!' + cmd.name}\`\n╰ \`${cmd.description || 'Sin descripción.'}\``
                    ).join('\n\n'));

                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('go_home')
                        .setLabel('INICIO')
                        .setEmoji(emojis.star || '⭐')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setEmoji('✖️')
                        .setStyle(ButtonStyle.Danger)
                ));
            }

            return { embeds: [embed], components: rows };
        };

        // --- 🚀 EJECUCIÓN Y RECOLECTOR ---
        // Forzamos fetchReply para que el recolector funcione tanto en prefijo como en Slash
        const response = await input.reply({ ...generarInterfaz(), fetchReply: true });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button,
            time: 60000 
        });

        collector.on('collect', async i => {
            // Evita que otros usuarios usen los botones y les da un aviso elegante
            if (i.user.id !== user.id) {
                return i.reply({ content: `${emojis.exclamation || '❌'} Esos accesos están restringidos para ti.`, ephemeral: true });
            }

            if (i.customId === 'close') {
                await i.update({ content: `${emojis.pinkbow} *Archivos cerrados...*`, embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2000);
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                currentCategory = 'home';
            } else if (i.customId.startsWith('cat_')) {
                currentCategory = i.customId.replace('cat_', '');
            }

            // Actualizamos la interfaz con la nueva categoría
            await i.update(generarInterfaz()).catch(e => console.error("Error al actualizar Help:", e));
        });
        
        // Cuando pasan los 60 segundos, desactiva los botones para que no quede basura visual
        collector.on('end', () => {
            response.edit({ components: [] }).catch(() => null);
        });
    }
};
