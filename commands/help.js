const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const emojis = require('../emojis.json'); 

module.exports = {
    name: 'help',
    aliases: ['h', 'ayuda'],
    description: 'Muestra el menú de ayuda interactivo ✨',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const query = isSlash ? (input.options.getString('comando') || "").toLowerCase() : args?.[0]?.toLowerCase();
        const rosaPastel = "#FFB7C5";

        // --- 🐾 AYUDA ESPECÍFICA (EPHEMERAL) ---
        const ayudaNekos = {
            astra: "👑 **Astra** se obtiene al adquirir un rango **Premium**.",
            nyx: "🌑 **Nyx** aparece cuando alcanzas el **Nivel 10**.",
            solas: "☁️ **Solas** se une a ti tras realizar **100 acciones** sociales.",
            mizuki: "🌸 **Mizuki** llega tras enviar **5,000 mensajes**.",
            koko: "🍓 **Koko** es una pieza de colección rotativa en la **Boutique**."
        };

        if (query && ayudaNekos[query]) {
            return input.reply({ 
                embeds: [new EmbedBuilder().setTitle(`Guía de Neko: ${query.charAt(0).toUpperCase() + query.slice(1)}`).setDescription(`> ${ayudaNekos[query]}`).setColor(rosaPastel)], 
                ephemeral: true 
            });
        }

        const paginas = [
            { id: 'inicio', title: '✨ Rockstar Help Menu ✨', tipo: 'inicio', description: '¡Hola, reina! Selecciona una categoría abajo para comenzar.' },
            { id: 'categorias', title: '📚 Índice de Comandos', tipo: 'navegacion', description: 'Explora las secciones disponibles.', comandos: '`Economía` • `Matrimonios` • `Nekos` • `Acción` • `Reacción` • `Utilidad`' },
            { id: 'nekos', title: '🐾 Colección de Nekos', tipo: 'detalle', description: 'Insignias exclusivas de perfil.\n\n*Ayuda individual:* `!!help [nombre]`.' },
            { id: 'eco', title: '💰 Economía & Juegos', tipo: 'detalle', description: '`daily`, `work`, `mine`, `fish`, `rob`, `bal`, `shop`, `pay`.' },
            { id: 'marry', title: '💍 Matrimonios & Harem', tipo: 'detalle', description: '`marry`, `divorce`, `harem`, `propose`, `ship`, `waifu`, `husbando`.' },
            { id: 'acc', title: '🎭 Comandos de Acción', tipo: 'detalle', description: '`hug`, `kiss`, `slap`, `pat`, `bite`, `poke`, `shoot`, `splash`.' }
        ];

        const generarAyuda = (index) => {
            const data = paginas[index];
            
            // --- 💡 GUÍA DE BOTONES RESALTADA ---
            let guiaBotones = "";
            if (data.tipo === 'navegacion') {
                guiaBotones = `\n\n**୨୧ ┈┈┈┈ 🏷️ Guía de Navegación ┈┈┈┈ ୨୧**\n` +
                              `${emojis.pinkbow} \`Volver\` • ${emojis.whitebow} \`Atrás\` • ${emojis.arrow} \`Siguiente\` • ${emojis.heart} \`Cerrar\``;
            } else if (data.tipo === 'detalle') {
                guiaBotones = `\n\n**୨୧ ┈┈┈┈ 🏷️ Guía de Navegación ┈┈┈┈ ୨୧**\n` +
                              `${emojis.pinkbow} \`Volver\` • ${emojis.heart} \`Cerrar\``;
            }

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(`${data.description}${data.comandos ? `\n\n🌸 **Secciones:**\n${data.comandos}` : ''}${guiaBotones}`)
                .setColor(rosaPastel)
                .setFooter({ text: `Rockstar System • Página ${index + 1} de ${paginas.length}` });

            const filas = [];

            if (data.tipo === 'inicio') {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('help_menu').setPlaceholder('Selecciona una categoría... 🌸')
                        .addOptions([
                            { label: 'Categorías', value: '1', emoji: emojis.pinkstars },
                            { label: 'Nekos', value: '2', emoji: '🐾' },
                            { label: 'Economía', value: '3', emoji: '💰' },
                            { label: 'Matrimonios', value: '4', emoji: '💍' },
                            { label: 'Acción', value: '5', emoji: '🎭' }
                        ])
                );
                filas.push(menu);
            } else {
                const botonesRow = new ActionRowBuilder();
                
                // Botón Volver (Coquette Bow 🎀)
                botonesRow.addComponents(new ButtonBuilder().setCustomId('volver').setEmoji(emojis.pinkbow).setStyle(ButtonStyle.Secondary));

                if (data.tipo === 'navegacion') {
                    botonesRow.addComponents(
                        new ButtonBuilder().setCustomId('atras').setEmoji(emojis.whitebow).setStyle(ButtonStyle.Secondary).setDisabled(index === 1),
                        new ButtonBuilder().setCustomId('adelante').setEmoji(emojis.arrow).setStyle(ButtonStyle.Secondary).setDisabled(index === paginas.length - 1)
                    );
                }

                // Botón Cerrar (Heart ❤️)
                botonesRow.addComponents(new ButtonBuilder().setCustomId('cerrar').setEmoji(emojis.heart).setStyle(ButtonStyle.Danger));
                filas.push(botonesRow);
            }

            return { embeds: [embed], components: filas };
        };

        const msg = await input.reply(generarAyuda(0));
        const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === user.id, time: 300000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'cerrar') return await i.message.delete().catch(() => {});
            
            let paginaActual = 0;
            const embedTitulo = i.message.embeds[0].title;
            const indexActual = paginas.findIndex(p => p.title === embedTitulo);

            if (i.customId === 'help_menu') paginaActual = parseInt(i.values[0]);
            else if (i.customId === 'volver') paginaActual = 0;
            else if (i.customId === 'atras') paginaActual = Math.max(1, indexActual - 1);
            else if (i.customId === 'adelante') paginaActual = Math.min(paginas.length - 1, indexActual + 1);

            await i.update(generarAyuda(paginaActual)).catch(() => {});
        });
    }
};