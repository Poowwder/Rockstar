const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ITEMS_FIJOS, BOLSA_ROTATIVA } = require('../data/items.js');
const { getShopItemsDB, getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'shop',
    description: '🛒 Visita el Mercado de las Sombras',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mira las ofertas del mercado y compra objetos'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        const member = guild ? (guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        const e = () => getRndEmoji(guild);

        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        let fijosDB = [];
        try { fijosDB = await getShopItemsDB(); } catch(err) { console.log("No hay ítems personalizados."); }

        let fijosFinales = [...(ITEMS_FIJOS || [])];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        const hoy = new Date();
        const seed = hoy.getFullYear() + hoy.getMonth() + hoy.getDate();
        let rotativaBase = BOLSA_ROTATIVA || [];
        let bolsaFiltrada = rotativaBase.filter(item => !inv[item.id]); 
        let rotados = [];
        let copiaBolsa = [...bolsaFiltrada];

        for (let i = 0; i < 10; i++) {
            if (copiaBolsa.length === 0) break;
            const index = (seed * (i + 1)) % copiaBolsa.length;
            rotados.push(copiaBolsa.splice(index, 1)[0]);
        }

        const tiendaTotal = [...fijosFinales, ...rotados];

        if (tiendaTotal.length === 0) {
            return input.reply({ content: `╰┈➤ ${e()} El mercado está vacío hoy.`, ephemeral: true });
        }

        const ITEMS_POR_PAGINA = 10;
        const totalPages = Math.ceil(tiendaTotal.length / ITEMS_POR_PAGINA);
        let currentPage = 0;

        const formatItem = (i) => `╰┈➤ ${e()} **${i.name}** ⊹ \`${i.price.toLocaleString()}\``;

        const generarInterfaz = (page) => {
            const startIndex = page * ITEMS_POR_PAGINA;
            const pageItems = tiendaTotal.slice(startIndex, startIndex + ITEMS_POR_PAGINA);

            const categoriasMap = {};
            const rotativosPage = [];

            pageItems.forEach(item => {
                if (item.tipo === 'rotativo') {
                    rotativosPage.push(item);
                } else {
                    const cat = item.categoria || 'VARIOS';
                    if (!categoriasMap[cat]) categoriasMap[cat] = [];
                    categoriasMap[cat].push(item);
                }
            });

            let textoFijos = '';
            for (const [nombreCat, items] of Object.entries(categoriasMap)) {
                textoFijos += `**─── ${e()} ${nombreCat.toUpperCase()} ${e()} ───**\n${items.map(formatItem).join('\n')}\n\n`;
            }

            let textoRotativos = '';
            if (rotativosPage.length > 0) {
                textoRotativos = `**─── ${e()} OFERTAS DEL DÍA ${e()} ───**\n${rotativosPage.map(formatItem).join('\n')}\n\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif') 
                .setDescription(
                    `**─── ${e()} MERCADO DE LAS SOMBRAS ${e()} ───**\n` +
                    `> *“Las rarezas de hoy están sobre la mesa, ${member.displayName}.”*\n\n` +
                    `${e()} **Tus Flores:** \`${(data.wallet || 0).toLocaleString()}\` flores\n\n` +
                    textoFijos + textoRotativos
                )
                // 🛠️ ÚNICO LUGAR SIN EMOJI DE SERVER: El Footer
                .setFooter({ text: `✦ Página ${page + 1} de ${totalPages} ⊹ La rotación cambia a medianoche ✦` });

            const select = new StringSelectMenuBuilder()
                .setCustomId('shop_buy')
                .setPlaceholder('Selecciona un tesoro para adquirir...')
                .addOptions(pageItems.map(i => ({
                    label: i.name.substring(0, 100), 
                    value: i.id,
                    description: `Costo: ${i.price.toLocaleString()} flores`.substring(0, 100),
                    emoji: i.emoji || e() // Reinsertado el e() aquí
                })));

            const rowSelect = new ActionRowBuilder().addComponents(select);

            const rowBotones = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel(`Anterior`)
                    .setEmoji(e()) // Reinsertado el e() aquí
                    .setStyle(ButtonStyle.Secondary) 
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel(`Siguiente`)
                    .setEmoji(e()) // Reinsertado el e() aquí
                    .setStyle(ButtonStyle.Secondary) 
                    .setDisabled(page === totalPages - 1)
            );

            return { embeds: [embed], components: [rowSelect, rowBotones] };
        };

        const response = await input.reply({ ...generarInterfaz(currentPage), fetchReply: true });

        const collector = response.createMessageComponentCollector({ time: 120000 }); 

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: `╰┈➤ ❌ ${e()} Estas sombras no te pertenecen.`, ephemeral: true });

            if (i.isButton()) {
                if (i.customId === 'prev_page' && currentPage > 0) currentPage--;
                if (i.customId === 'next_page' && currentPage < totalPages - 1) currentPage++;
                return await i.update(generarInterfaz(currentPage));
            }

            if (i.isStringSelectMenu() && i.customId === 'shop_buy') {
                const itemId = i.values[0];
                const itemToBuy = tiendaTotal.find(item => item.id === itemId);

                if (!itemToBuy) return i.reply({ content: `╰┈➤ ❌ ${e()} El objeto se desvaneció.`, ephemeral: true });

                data = await getUserData(user.id);

                if (itemToBuy.premium && (!data.premiumType || data.premiumType === 'none')) {
                    return i.reply({ content: `╰┈➤ 🚫 ${e()} **Acceso Denegado.**\nExclusivo para miembros VIP.`, ephemeral: true });
                }

                if ((data.wallet || 0) < itemToBuy.price) {
                    return i.reply({ 
                        content: `╰┈➤ 💸 ${e()} **Fondos Insuficientes.**\nTienes \`${(data.wallet || 0).toLocaleString()}\` flores.`, 
                        ephemeral: true 
                    });
                }

                data.wallet -= itemToBuy.price;
                let newInv = { ...(data.inventory || {}) };
                newInv[itemToBuy.id] = (newInv[itemToBuy.id] || 0) + 1;
                data.inventory = newInv;

                await updateUserData(user.id, data);

                const buyEmbed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setThumbnail('https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif') 
                    .setDescription(
                        `**─── ${e()} TRATO CERRADO ${e()} ───**\n\n` +
                        `╰┈➤ Has adquirido **${itemToBuy.name}**.\n` +
                        `╰┈➤ ${e()} **Costo:** \`-${itemToBuy.price.toLocaleString()}\` flores\n` +
                        `╰┈➤ ${e()} **Balance:** \`${data.wallet.toLocaleString()}\` flores`
                    )
                    .setFooter({ text: '✦ El artículo ha sido enviado a tu mochila (!!inv) ✦' });

                await i.update({ embeds: [buyEmbed], components: [] });
                collector.stop();
            }
        });

        collector.on('end', collected => {
            // Manejador híbrido por si el mensaje fue borrado o si es Slash
            if (isSlash) {
                 input.editReply({ components: [] }).catch(() => {});
            } else {
                 response.edit({ components: [] }).catch(() => {});
            }
        });
    }
};
