const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');
const mongoose = require('mongoose'); // Usando la conexión de mongodb.js

module.exports = {
    name: 'help',
    description: 'Panel de ayuda con botones y emojis locos ✨',
    category: 'info',
    aliases: ['ayuda', 'h'],
    usage: '!!help',
    async execute(message, args) {
        const { commands } = message.client;
        const guildEmojis = message.guild.emojis.cache.filter(e => e.available);

        // --- ✨ FUNCIÓN EMOJI ALEATORIO ---
        const getLocalEmoji = () => {
            if (guildEmojis.size === 0) return { toString: '✨', name: 'sparkles' };
            const picked = guildEmojis.random();
            return { toString: picked.toString(), name: picked.name };
        };

        const pastelColors = {
            economia: '#FDFD96', niveles: '#FFB7C5', diversion: '#A2D2FF',
            info: '#B5EAD7', action: '#FFDAC1', reaction: '#E0BBE4', default: '#FFB7C5'
        };

        // --- 🛠️ FILTRADO DE CATEGORÍAS ---
        // Eliminamos "categorias" y nos quedamos con las funcionales
        const categories = ['economia', 'niveles', 'diversion', 'action', 'reaction', 'info'];

        // --- 🏠 EMBED PRINCIPAL ---
        const mainEmbed = new EmbedBuilder()
            .setTitle(`${getLocalEmoji().toString} Centro de Ayuda - Rockstar`)
            .setDescription(
                `¡Hola **${message.author.username}**! Soy Rockstar. \n` +
                `Actualmente tengo **${commands.size} comandos** disponibles.\n\n` +
                `Usa los botones de abajo para explorar qué puedo hacer. \n` +
                `*Acepto tanto prefijo (\`!!\`) como comandos de barra (\`/\`).*`
            )
            .setColor(pastelColors.default)
            .setFooter({ text: 'Tip: Cada vez que abras una sección, verás emojis diferentes.' });

        // --- 🔘 FILAS DE BOTONES ---
        // Dividimos en dos filas para que quepan todos (máx 5 por fila)
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('economia').setLabel('Economía').setEmoji('💰').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('niveles').setLabel('Niveles').setEmoji('🎀').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('diversion').setLabel('Diversión').setEmoji('🎮').setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('action').setLabel('Acciones').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('reaction').setLabel('Reacciones').setEmoji('✨').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('info').setLabel('Utilidad').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
        );

        const rowControl = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji('❌').setStyle(ButtonStyle.Danger)
        );

        const response = await message.reply({ 
            embeds: [mainEmbed], 
            components: [row1, row2, rowControl] 
        });

        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ No puedes interactuar con este menú.', ephemeral: true });
            }

            if (i.customId === 'close') {
                await i.update({ content: '🌸 Menú de ayuda cerrado.', embeds: [], components: [] });
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                return await i.update({ embeds: [mainEmbed], components: [row1, row2, rowControl] });
            }

            // --- 📍 LÓGICA DE SECCIONES ---
            const choice = i.customId;
            const color = pastelColors[choice] || pastelColors.default;
            const emojiV = getLocalEmoji();

            const catCommands = commands.filter(cmd => cmd.category === choice)
                .map(cmd => {
                    const e = getLocalEmoji();
                    return `${e.toString} **!!${cmd.name}**\n╰ ${cmd.description || 'Sin descripción.'}`;
                })
                .join('\n\n') || 'No hay comandos registrados en esta categoría aún.';

            const backRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setEmoji(emojiV.toString).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setEmoji('❌').setStyle(ButtonStyle.Danger)
            );

            const sectionEmbed = new EmbedBuilder()
                .setTitle(`📍 Categoría: ${choice.toUpperCase()}`)
                .setDescription(`Aquí tienes los comandos de esta sección:\n\n${catCommands}`)
                .setColor(color)
                .addFields({ name: '⁠', value: `*Presiona el botón ${emojiV.toString} para regresar al inicio.*` });

            await i.update({ embeds: [sectionEmbed], components: [backRow] });
        });

        collector.on('end', () => {
            response.edit({ components: [] }).catch(() => null);
        });
    }
};