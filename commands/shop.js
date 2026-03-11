const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { ITEMS_FIJOS, BOLSA_ROTATIVA } = require('../data/items.js');
const { getShopItemsDB, getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR ---
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
        .setDescription('🛒 Mira las ofertas del mercado y compra objetos'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        const member = guild ? (guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        
        // Función rápida para obtener emojis en cualquier parte
        const e = () => getRndEmoji(guild);

        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // 1. Cargar ítems de la DB
        let fijosDB = [];
        try { fijosDB = await getShopItemsDB(); } catch(e) { console.log("No hay ítems personalizados."); }

        // 2. Mezclar con la lista base
        let fijosFinales = [...(ITEMS_FIJOS || [])];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        // 3. Rotación Diaria
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
            return input.reply({ content: `> ${e()} El mercado está vacío hoy. Vuelve en otra ocasión.`, ephemeral: true });
        }

        // --- ⚙️ MOTOR DE AGRUPAMIENTO DINÁMICO ---
        const formatItem = (i) => `╰┈➤ ${i.emoji || '📦'} **${i.name}** ⊹ \`${i.price.toLocaleString()} 🌸\``;
        
        // Agrupamos los ítems fijos por su categoría
        const categoriasMap = {};
        fijosFinales.forEach(item => {
            const cat = item.categoria || 'VARIOS';
            if (!categoriasMap[cat]) categoriasMap[cat] = [];
            categoriasMap[cat].push(item);
        });

        // Construimos el texto de las secciones fijas
        let fijosTexto = '';
        for (const [nombreCat, items] of Object.entries(categoriasMap)) {
            fijosTexto += `**─── ${e()} ${nombreCat} ${e()} ───**\n${items.map(formatItem).join('\n')}\n\n`;
        }

        // --- 📄 EMBED ROCKSTAR ---
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            // GIF Aesthetic tipo Dark/Goth para la tienda
            .setThumbnail('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif')
            .setDescription(
                `> ${e()} **Mercado de las Sombras** ${e()}\n` +
                `> *“Las rarezas de hoy están sobre la mesa, ${member.displayName}.”*\n\n` +
                `${e()} **Tus Flores:** \`${(data.wallet || 0).toLocaleString()} 🌸\`\n\n` +
                fijosTexto +
                (rotados.length > 0 ? `**─── ${e()} OFERTAS DEL DÍA ${e()} ───**\n${rotados.map(formatItem).join('\n')}` : '')
            )
            .setFooter({ text: 'El inventario rotativo cambia a la medianoche ⊹ Economía' });

        const select = new StringSelectMenuBuilder()
            .setCustomId('shop_buy')
            .setPlaceholder('Selecciona un tesoro para adquirir...')
            .addOptions(tiendaTotal.slice(0, 25).map(i => ({
                label: i.name,
                value: i.id,
                description: `Costo: ${i.price} flores`,
                emoji: i.emoji || '📦'
            })));

        const row = new ActionRowBuilder().addComponents(select);
        
        const response = await input.reply({ embeds: [embed], components: [row], fetchReply: true });

        // --- 🚀 SISTEMA DE PAGO ---
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: "❌ Esta transacción no te pertenece.", ephemeral: true });

            const itemId = i.values[0];
            const itemToBuy = tiendaTotal.find(item => item.id === itemId);

            if (!itemToBuy) return i.reply({ content: "❌ El objeto se desvaneció entre las sombras.", ephemeral: true });

            data = await getUserData(user.id);

            if ((data.wallet || 0) < itemToBuy.price) {
                return i.reply({ 
                    content: `> 💸 **Fondos Insuficientes.**\n> Tienes \`${(data.wallet || 0).toLocaleString()} 🌸\`, el objeto cuesta \`${itemToBuy.price.toLocaleString()} 🌸\`.`, 
                    ephemeral: true 
                });
            }

            data.wallet -= itemToBuy.price;
            if (!data.inventory) data.inventory = {};
            data.inventory[itemToBuy.id] = (data.inventory[itemToBuy.id] || 0) + 1;

            await updateUserData(user.id, data);

            const buyEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setDescription(
                    `> 🛍️ **Transacción Exitosa** ${e()}\n\n` +
                    `╰┈➤ Has adquirido **${itemToBuy.name}**.\n` +
                    `╰┈➤ 💸 **Costo:** \`-${itemToBuy.price.toLocaleString()} 🌸\`\n` +
                    `╰┈➤ 🏦 **Balance:** \`${data.wallet.toLocaleString()} 🌸\``
                );

            await i.update({ embeds: [buyEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                response.edit({ components: [] }).catch(() => {});
            }
        });
    }
};
