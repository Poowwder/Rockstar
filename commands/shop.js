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
    // 🚀 ESTO FALTABA: Sin esto, los Slash Commands no lo reconocen
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Mira las ofertas del mercado y compra objetos'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        const member = guild ? (guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        const rndEmj = getRndEmoji(guild);

        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // 1. Cargar ítems que creaste vía !!setitem
        let fijosDB = [];
        try { fijosDB = await getShopItemsDB(); } catch(e) { console.log("No hay ítems personalizados en DB."); }

        // 2. Mezclar con la lista base (Aseguramos que no explote si ITEMS_FIJOS está vacío)
        let fijosFinales = [...(ITEMS_FIJOS || [])];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        // 3. Rotación Diaria
        const hoy = new Date();
        const seed = hoy.getFullYear() + hoy.getMonth() + hoy.getDate();
        
        // Filtra los que ya tiene en el inventario
        let rotativaBase = BOLSA_ROTATIVA || [];
        let bolsaFiltrada = rotativaBase.filter(item => !inv[item.id]);
        let rotados = [];
        let copiaBolsa = [...bolsaFiltrada];

        for (let i = 0; i < 10; i++) { // Mostramos 10 al azar
            if (copiaBolsa.length === 0) break;
            const index = (seed * (i + 1)) % copiaBolsa.length;
            rotados.push(copiaBolsa.splice(index, 1)[0]);
        }

        const tiendaTotal = [...fijosFinales, ...rotados];

        if (tiendaTotal.length === 0) {
            return input.reply({ content: `> ${rndEmj} El mercado está vacío hoy o ya compraste todo. Vuelve mañana.`, ephemeral: true });
        }

        // --- 📄 CONSTRUCCIÓN DEL MENÚ ESTÉTICO ---
        const formatItem = (i) => `╰┈➤ ${i.emoji || '📦'} **${i.name}** ⊹ \`${i.price.toLocaleString()} 🌸\``;

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif')
            .setDescription(
                `> ${rndEmj} **Mercado de las Sombras**\n` +
                `> *Las rarezas de hoy están sobre la mesa, ${member.displayName}.*\n\n` +
                `💰 **Tus Flores:** \`${(data.wallet || 0).toLocaleString()} 🌸\`\n\n` +
                (fijosFinales.length > 0 ? `**─── ✦ OBJETOS FIJOS ✦ ───**\n${fijosFinales.map(formatItem).join('\n')}\n\n` : '') +
                (rotados.length > 0 ? `**─── ✦ OFERTAS DEL DÍA ✦ ───**\n${rotados.map(formatItem).join('\n')}` : '')
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

        // --- 🚀 ESTO FALTABA: EL SISTEMA DE PAGO Y TRANSACCIÓN ---
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: "❌ Esta transacción no está a tu nombre.", ephemeral: true });

            const itemId = i.values[0];
            const itemToBuy = tiendaTotal.find(item => item.id === itemId);

            if (!itemToBuy) return i.reply({ content: "❌ Ese objeto ha desaparecido de las sombras.", ephemeral: true });

            // Refrescar data por si gastó dinero en otro lado mientras miraba el menú
            data = await getUserData(user.id);

            // Verificar si tiene suficiente dinero
            if ((data.wallet || 0) < itemToBuy.price) {
                return i.reply({ 
                    content: `> 💸 **Fondos Insuficientes.**\n> Tienes \`${(data.wallet || 0).toLocaleString()} 🌸\`, pero el objeto cuesta \`${itemToBuy.price.toLocaleString()} 🌸\`.`, 
                    ephemeral: true 
                });
            }

            // Procesar la compra
            data.wallet -= itemToBuy.price;
            if (!data.inventory) data.inventory = {};
            data.inventory[itemToBuy.id] = (data.inventory[itemToBuy.id] || 0) + 1; // Le sumamos 1 al inventario

            await updateUserData(user.id, data);

            // Mensaje de éxito estético
            const buyEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setDescription(
                    `> 🛍️ **Transacción Exitosa** ${rndEmj}\n\n` +
                    `╰┈➤ Has adquirido **${itemToBuy.name}**.\n` +
                    `╰┈➤ 💸 **Costo:** \`-${itemToBuy.price.toLocaleString()} 🌸\`\n` +
                    `╰┈➤ 🏦 **Nuevo Balance:** \`${data.wallet.toLocaleString()} 🌸\``
                );

            await i.update({ embeds: [buyEmbed], components: [] });
            collector.stop();
        });

        // Si se acaba el tiempo, quitar el menú para evitar errores
        collector.on('end', collected => {
            if (collected.size === 0) {
                response.edit({ components: [] }).catch(() => {});
            }
        });
    }
};
