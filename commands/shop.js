const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType 
} = require('discord.js');
const { getTiendaHoy } = require('../data/items.js');
const { getUserData, updateUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 

module.exports = {
    name: 'shop',
    async execute(input) {
        const user = input.user || input.author;
        const guild = input.guild; 
        
        // --- 1. Lógica de Emojis del Servidor ---
        const localEmojis = guild.emojis.cache.filter(e => e.available);
        const getRndEmojiStr = () => localEmojis.size > 0 ? localEmojis.random().toString() : '';

        // Helper para crear botones estéticos
        const crearBoton = (id, label, style = ButtonStyle.Secondary) => {
            const btn = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
            const em = getRndEmojiStr();
            if (em) btn.setEmoji(em);
            return btn;
        };

        let data = await getUserData(user.id);
        const profileDB = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
        const tiendaCompleta = getTiendaHoy();

        // --- 2. Constructor de la Interfaz ---
        const generarInterfaz = (categoria = 'all') => {
            // Botones Grises y uno Rojo
            const rowButtons = new ActionRowBuilder().addComponents(
                crearBoton('cat_all', 'Todo'),
                crearBoton('cat_nekos', 'Nekos'),
                crearBoton('cat_items', 'Objetos'),
                crearBoton('cat_vip', 'Premium'),
                crearBoton('close_shop', 'Cerrar', ButtonStyle.Danger)
            );

            const filtrados = tiendaCompleta.filter(item => {
                const yaLoTiene = profileDB?.Nekos?.some(url => url.includes(item.id.toUpperCase()));
                if ((item.id === 'astra' || item.id === 'koko') && yaLoTiene) return false;
                
                if (categoria === 'cat_nekos') return item.type === 'neko';
                if (categoria === 'cat_items') return item.type === 'item';
                if (categoria === 'cat_vip') return item.premium === true;
                return true; 
            }).slice(0, 25);

            const shopEmbed = new EmbedBuilder()
                .setTitle(`${getRndEmojiStr()} ‧₊˚ Boutique Rockstar ˚₊‧ ${getRndEmojiStr()}`.trim())
                .setColor('#2b2d31') // Dark Aesthetic
                .setDescription(
                    `*“Vístete de sombras y brilla como el vacío...”* 🖤\n\n` +
                    `**Sección:** \`${categoria.toUpperCase()}\`\n\n` + 
                    (filtrados.length > 0 ? filtrados.map(i => {
                        return `${getRndEmojiStr()} **${i.name}** ‧ \`${i.price.toLocaleString()} 🌸\``.trim();
                    }).join('\n') : "🥀 *No hay nada para ti en esta oscuridad...*")
                )
                .setFooter({ 
                    text: `Balance: ${data.coins?.toLocaleString()} 🌸 | ${user.username} ♡`, 
                    iconURL: user.displayAvatarURL() 
                });

            const rowMenu = new ActionRowBuilder();
            if (filtrados.length > 0) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('buy_item')
                    .setPlaceholder('Selecciona tu próximo capricho...');
                
                filtrados.forEach(i => {
                    const opt = new StringSelectMenuOptionBuilder()
                        .setLabel(i.name)
                        .setDescription(`${i.price} 🌸 ‧ Toque para comprar`)
                        .setValue(i.id);
                    const optEm = getRndEmojiStr();
                    if (optEm) opt.setEmoji(optEm);
                    selectMenu.addOptions(opt);
                });
                
                rowMenu.addComponents(selectMenu);
                return { embeds: [shopEmbed], components: [rowButtons, rowMenu] };
            }
            return { embeds: [shopEmbed], components: [rowButtons] };
        };

        const response = await input.reply(generarInterfaz());

        // --- 3. Colector Interactivo ---
        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            // Error: No es su tienda
            if (i.user.id !== user.id) {
                return i.reply({ 
                    content: '🥀 Las miradas son gratis, tocar no... Abre tu propio catálogo con `!!shop`.', 
                    ephemeral: true 
                });
            }

            // Acción: Cerrar tienda
            if (i.customId === 'close_shop') {
                await i.message.delete().catch(() => null);
                collector.stop();
                return;
            }

            // Acción: Comprar
            if (i.isStringSelectMenu()) {
                const selectedID = i.values[0];
                const item = tiendaCompleta.find(it => it.id === selectedID);
                
                // Error: Sin dinero
                if (data.coins < item.price) {
                    return i.reply({ 
                        content: `🕸️ Tu billetera está llorando... Te faltan **${(item.price - data.coins).toLocaleString()} 🌸** para este capricho.`, 
                        ephemeral: true 
                    });
                }

                try {
                    // Actualizar DB
                    data.coins -= item.price;
                    await updateUserData(user.id, { coins: data.coins });

                    if (item.type === 'neko') {
                        await UserProfile.updateOne(
                            { UserID: user.id, GuildID: guild.id },
                            { $push: { Nekos: item.url } }
                        );
                    }

                    // Éxito Ephemeral
                    await i.reply({ 
                        content: `🖤 Trato hecho. **${item.name}** ahora te pertenece... cuídalo bien. 🎀`, 
                        ephemeral: true 
                    });
                    
                    // Actualizar tienda
                    const currentCat = i.message.embeds[0].description.split('`')[1].toLowerCase();
                    await i.message.edit(generarInterfaz(currentCat));

                } catch (error) {
                    console.error(error);
                    await i.reply({ 
                        content: '⛓️ Las sombras se tragaron tu transacción... Ocurrió un error. Intenta de nuevo.', 
                        ephemeral: true 
                    });
                }
                return;
            }

            // Navegación
            await i.update(generarInterfaz(i.customId));
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user') {
                response.edit({ components: [] }).catch(() => null);
            }
        });
    }
};
