const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { ITEMS_FIJOS, BOLSA_ROTATIVA } = require('../utils/items.js');
const { getShopItemsDB, getUserData } = require('../databaseManager.js');

module.exports = {
    name: 'shop',
    async execute(input) {
        const user = input.author || input.user;
        const data = await getUserData(user.id);
        const inv = data.inventory || {};

        // 1. Cargar ítems que TÚ creaste vía !!setitem
        const fijosDB = await getShopItemsDB();

        // 2. Mezclar con la lista base (que ahora está vacía de roles)
        let fijosFinales = [...ITEMS_FIJOS];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        // 3. Rotación Diaria
        const hoy = new Date();
        const seed = hoy.getFullYear() + hoy.getMonth() + hoy.getDate();
        
        let bolsaFiltrada = BOLSA_ROTATIVA.filter(item => !inv[item.id]);
        let rotados = [];
        let copiaBolsa = [...bolsaFiltrada];

        for (let i = 0; i < 10; i++) { // Mostramos 10 al azar
            if (copiaBolsa.length === 0) break;
            const index = (seed * (i + 1)) % copiaBolsa.length;
            rotados.push(copiaBolsa.splice(index, 1)[0]);
        }

        const tiendaTotal = [...fijosFinales, ...rotados];

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setTitle('🛒 ⟢ ₊˚ Rockstar Market ˚₊ ⟣ 🛒')
            .setThumbnail('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif')
            .setDescription(`**Tu Saldo:** 🌸 \`${(data.wallet || 0).toLocaleString()}\` flores\n\n` +
                           (fijosFinales.length > 0 ? `**─── ✦ PERSONALIZADOS ✦ ───**\n${fijosFinales.map(i => `${i.emoji} **${i.name}** ⊹ \`${i.price.toLocaleString()}\``).join('\n')}\n\n` : '') +
                           `**─── ✦ OFERTAS DEL DÍA ✦ ───**\n` +
                           rotados.map(i => `${i.emoji} **${i.name}** ⊹ \`${i.price.toLocaleString()}\``).join('\n'));

        const select = new StringSelectMenuBuilder()
            .setCustomId('shop_buy')
            .setPlaceholder('Selecciona un tesoro...')
            .addOptions(tiendaTotal.slice(0, 25).map(i => ({
                label: i.name,
                value: i.id,
                description: `Precio: ${i.price} flores`,
                emoji: i.emoji
            })));

        const row = new ActionRowBuilder().addComponents(select);
        await input.reply({ embeds: [embed], components: [row] });
    }
};
