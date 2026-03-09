const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'help',
    aliases: ['h', 'ayuda'],
    description: 'Menú de ayuda con acceso total para la creadora ✨',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const OWNER_ID = '1134261491745493032'; // 👑 Tu ID real
        const rosaPastel = "#FFB7C5";

        // --- 🎨 SISTEMA DE AUTO-EMOJI ---
        const emojisAzar = ['🌸', '🎀', '✨', '🩰', '🍭', '🍓', '🧁', '🌷', '☁️', '🦢'];
        const getEmoji = (nombre) => {
            return emojis[nombre] || emojisAzar[Math.floor(Math.random() * emojisAzar.length)];
        };

        // --- 👑 VERIFICACIÓN DE PODER ---
        // Si eres tú, eres Premium automáticamente. Para otros, se puede añadir otra lógica luego.
        const esPremium = (user.id === OWNER_ID); 

        const totalComandos = client.commands.size;
        const paginasTotales = esPremium ? 8 : 7;

        const paginas = [
            { 
                id: 'inicio', 
                title: '✨ Rockstar System ✨', 
                description: `¡Hola, reina! Soy tu asistente de Rockstar.\nActualmente tengo **${totalComandos}** comandos listos para ti.\n\n🌸 Para ver ayuda detallada usa: \`!!help [comando]\`\n\nSelecciona una categoría abajo para comenzar.` 
            },
            { 
                id: 'categorias', title: '📚 Índice de Comandos', 
                description: 'Explora todas las secciones disponibles en el sistema Rockstar.\n\n🌸 **Secciones:**\n`Moderación` • `Economía` • `Matrimonios` • `Nekos` • `Acción` • `Configuración`' 
            },
            { id: 'mod', title: '🛡️ Moderación', description: 'Herramientas potentes para mantener el orden y la seguridad.\n\n`ban`, `kick`, `warn`, `mute`, `timeout`, `purge`.' },
            { id: 'eco', title: '💰 Economía', description: 'Gana NekoCoins, trabaja y compite con otros usuarios.\n\n`daily`, `work`, `mine`, `fish`, `rob`, `bal`, `shop`.' },
            { id: 'marry', title: '💍 Matrimonios', description: 'El sistema social completo para parejas, harems y familias.\n\n`marry`, `divorce`, `harem`, `propose`, `ship`, `waifu`.' },
            { id: 'acc', title: '🎭 Acción', description: 'Expresa tus sentimientos con hermosas interacciones visuales.\n\n`hug`, `kiss`, `slap`, `pat`, `bite`, `poke`, `shoot`.' },
            { id: 'config', title: '⚙️ Configuración', description: 'Ajustes técnicos y de personalización exclusivos para admins.\n\n`setup`, `setlogs`, `setbutton`, `setprefix`.' },
            { id: 'premium', title: '💎 Comandos Premium', description: 'Funciones VIP exclusivas.\n\n`custom-role`, `fancy-embed`, `bypass-cooldown`, `special-badges`.' }
        ];

        const generarAyuda = (index) => {
            const data = paginas[index];
            const guia = `\n\n- # ${getEmoji('pinkbow')} • *Volver* ${getEmoji('whitebow')} • *Atrás* ${getEmoji('arrow')} • *Siguiente* ${getEmoji('heart')} • *Cerrar*`;

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(`${data.description}${index !== 0 ? guia : ""}`)
                .setColor(rosaPastel)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: `Página ${index + 1} de ${paginasTotales}` });

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
                    new ButtonBuilder().setCustomId('volver').setEmoji(getEmoji('pinkbow')).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('atras').setEmoji(getEmoji('whitebow')).setStyle(ButtonStyle.Secondary).setDisabled(index === 1),
                    new ButtonBuilder().setCustomId('adelante').setEmoji(getEmoji('arrow')).setStyle(ButtonStyle.Secondary).setDisabled(index === paginasTotales - 1)
                );

                // El diamante solo aparece si eres tú (o premium en el futuro)
                if (esPremium) {
                    botonesRow.addComponents(new ButtonBuilder().setCustomId('ir_premium').setEmoji('💎').setStyle(ButtonStyle.Primary));
                }

                botonesRow.addComponents(new ButtonBuilder().setCustomId('cerrar').setEmoji(getEmoji('heart')).setStyle(ButtonStyle.Danger));
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
            else if (i.customId === 'adelante') paginaActual = Math.min(paginasTotales - 1, indexActual + 1);
            else if (i.customId === 'ir_premium') paginaActual = 7;

            await i.update(generarAyuda(paginaActual)).catch(() => {});
        });
    }
};