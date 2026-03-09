const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ComponentType
} = require('discord.js');
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'help',
    aliases: ['h', 'ayuda'],
    description: 'Menú de ayuda dinámico con respuestas privadas ✨',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const OWNER_ID = '1134261491745493032'; 
        const rosaPastel = "#FFB7C5";

        // --- 🔍 AYUDA ESPECÍFICA (Privada/Ephemeral) ---
        const comandoBusqueda = args?.[0]?.toLowerCase();
        
        if (comandoBusqueda === 'welcome' || comandoBusqueda === 'goodbye' || comandoBusqueda === 'bienvenida' || comandoBusqueda === 'despedida') {
            const variablesEmbed = new EmbedBuilder()
                .setTitle(`✨ Guía de Diseño: ${comandoBusqueda.toUpperCase()}`)
                .setColor(rosaPastel)
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription(
                    `Usa \`/${comandoBusqueda}\` para configurar.\n\n` +
                    `📝 **Variables para el Modal:**\n` +
                    `• \`{username}\` - Nombre de usuario\n` +
                    `• \`{taguser}\` - Menciona al usuario\n` +
                    `• \`{serveruser}\` - Nombre del server\n` +
                    `• \`{membercount}\` - Humanos (sin bots)\n` +
                    `• \`{serverimg}\` - Icono del servidor\n\n` +
                    `⏰ **Opciones:**\n` +
                    `En **Timestamp**, escribe \`yes\` para activarlo.`
                )
                .setFooter({ text: 'Esta guía es privada y solo tú la ves ✨' });

            const rowEjemplo = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ver_ejemplo_visual')
                    .setLabel('Ver Ejemplo Visual')
                    .setEmoji('🖼️')
                    .setStyle(ButtonStyle.Primary)
            );

            // Respondemos de forma EFÍMERA
            return await input.reply({ embeds: [variablesEmbed], components: [rowEjemplo], ephemeral: true });
        }

        // --- 📚 MENÚ DE AYUDA GENERAL (Público) ---
        const esPremium = (user.id === OWNER_ID); 
        const paginas = [
            { id: 'inicio', title: '✨ Rockstar System ✨', description: `¡Hola, reina! Soy tu asistente de Rockstar.\nActualmente tengo **${client.commands.size}** comandos listos.\n\n🌸 Selecciona una categoría abajo.` },
            { id: 'categorias', title: '📚 Índice de Comandos', description: 'Explora las secciones Rockstar.' },
            { id: 'mod', title: '🛡️ Moderación', description: '`ban`, `kick`, `warn`, `mute`, `purge`, `welcome`, `goodbye`.' },
            { id: 'eco', title: '💰 Economía', description: '`daily`, `work`, `mine`, `fish`, `rob`, `bal`, `shop`.' },
            { id: 'marry', title: '💍 Matrimonios', description: '`marry`, `divorce`, `harem`, `propose`, `ship`, `waifu`.' },
            { id: 'acc', title: '🎭 Acción', description: '`hug`, `kiss`, `slap`, `pat`, `bite`, `poke`, `shoot`.' },
            { id: 'config', title: '⚙️ Configuración', description: '`setup`, `setlogs`, `setbutton`, `setprefix`.' },
            { id: 'premium', title: '💎 Comandos Premium', description: 'Funciones VIP exclusivas.' }
        ];

        const paginasVisibles = esPremium ? paginas : paginas.slice(0, -1);
        const paginasTotales = paginasVisibles.length;

        const generarAyuda = (index) => {
            const data = paginasVisibles[index];
            const guia = `\n\n- # ${emojis.pinkbow || '🎀'} • *Volver* ${emojis.whitebow || '⬅️'} • *Atrás* ${emojis.arrow || '➡️'} • *Siguiente* ${emojis.heart || '❤️'} • *Cerrar*`;

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(`${data.description}${index !== 0 ? guia : ""}`)
                .setColor(rosaPastel)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: `Página ${index + 1} de ${paginasTotales} • Rockstar ✨` });

            const filas = [];
            if (index === 0) {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('help_menu')
                        .setPlaceholder('Selecciona una categoría... 🌸')
                        .addOptions([
                            { label: 'Categorías', value: '1', emoji: '📚' },
                            { label: 'Moderación', value: '2', emoji: '🛡️' },
                            { label: 'Economía', value: '3', emoji: '💰' },
                            { label: 'Matrimonios', value: '4', emoji: '💍' },
                            { label: 'Acción', value: '5', emoji: '🎭' },
                            { label: 'Configuración', value: '6', emoji: '⚙️' }
                        ])
                );
                filas.push(menu);
            } else {
                const botonesRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('volver').setEmoji(emojis.pinkbow || '🎀').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('atras').setEmoji(emojis.whitebow || '⬅️').setStyle(ButtonStyle.Secondary).setDisabled(index === 1),
                    new ButtonBuilder().setCustomId('adelante').setEmoji(emojis.arrow || '➡️').setStyle(ButtonStyle.Secondary).setDisabled(index === paginasTotales - 1),
                    new ButtonBuilder().setCustomId('cerrar').setEmoji(emojis.heart || '❤️').setStyle(ButtonStyle.Danger)
                );
                filas.push(botonesRow);
            }
            return { embeds: [embed], components: filas };
        };

        const response = await input.reply(generarAyuda(0));
        const collector = response.createMessageComponentCollector({ time: 300000 });
        let paginaActual = 0;

        collector.on('collect', async (i) => {
            if (i.user.id !== user.id) return i.reply({ content: '🌸 No puedes usar este menú.', ephemeral: true });
            
            // --- NUEVA LÓGICA: EJEMPLO VISUAL ---
            if (i.customId === 'ver_ejemplo_visual') {
                const ejemploEmbed = new EmbedBuilder()
                    .setTitle('¡Bienvenida a Rockstar Guild!')
                    .setDescription(`🌸 ¡Hola **${user.username}**! Disfruta de tu estadía.\nEres el miembro número **${i.guild.memberCount}** de nuestra familia.`)
                    .setColor(rosaPastel)
                    .setFooter({ text: `Enviado desde ${i.guild.name}`, iconURL: i.guild.iconURL() })
                    .setTimestamp();
                return await i.reply({ content: '✨ **Ejemplo de cómo quedaría tu diseño:**', embeds: [ejemploEmbed], ephemeral: true });
            }

            if (i.customId === 'cerrar') return await i.message.delete().catch(() => {});
            
            if (i.customId === 'help_menu') paginaActual = parseInt(i.values[0]);
            else if (i.customId === 'volver') paginaActual = 0;
            else if (i.customId === 'atras') paginaActual = Math.max(1, paginaActual - 1);
            else if (i.customId === 'adelante') paginaActual = Math.min(paginasTotales - 1, paginaActual + 1);

            await i.update(generarAyuda(paginaActual)).catch(() => {});
        });
    }
};