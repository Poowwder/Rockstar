const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getShopItems, getUserData, updateUserData } = require('../databaseManager.js');
const { rolesFijos, poolRotativo } = require('../utils/shopConfig.js');

module.exports = {
    name: 'shop',
    async execute(input) {
        const user = input.author || input.user;
        let data = await getUserData(user.id);
        const fijosDB = await getShopItems(); // Los creados con !!set-item

        // Filtrar Neko y elegir rotativos
        let pool = poolRotativo.filter(i => i.tipo === 'neko' ? !(data.inventory?.[i.id] > 0) : true);
        const rotativos = pool.sort(() => 0.5 - Math.random()).slice(0, 3);

        const catalogo = [...rolesFijos, ...fijosDB, ...rotativos];

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setTitle('🛒 ⟢ ₊˚ Rockstar Market ˚₊ ⟣ 🛒')
            .setDescription(`**Saldo:** 🌸 \`${(data.wallet || 0).toLocaleString()}\` flores\n\n` +
                           `**─── PERSONALIZADOS & ROLES ───**\n` +
                           [...rolesFijos, ...fijosDB].map(i => `${i.emoji || '✨'} **${i.nombre}**: \`${i.precio}\``).join('\n') +
                           `\n\n**─── SUMINISTROS DEL DÍA ───**\n` +
                           rotativos.map(i => `${i.emoji || '📦'} **${i.nombre}**: \`${i.precio}\``).join('\n'));

        const select = new StringSelectMenuBuilder()
            .setCustomId('buy')
            .setPlaceholder('¿Qué deseas adquirir?')
            .addOptions(catalogo.map(i => ({ label: i.nombre, value: i.id, description: `Costo: ${i.precio} flores` })));

        const row = new ActionRowBuilder().addComponents(select);
        const response = await input.reply({ embeds: [embed], components: [row] });

        const collector = response.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 60000 });

        collector.on('collect', async i => {
            const item = catalogo.find(it => it.id === i.values[0]);
            if ((data.wallet || 0) < item.precio) return i.reply({ content: "Flores insuficientes.", ephemeral: true });

            data.wallet -= item.precio;
            if (item.roleID) {
                const member = i.guild.members.cache.get(user.id);
                await member.roles.add(item.roleID).catch(() => null);
            } else {
                if (!data.inventory) data.inventory = {};
                data.inventory[item.id] = (data.inventory[item.id] || 0) + (item.cantidad || 1);
            }

            await updateUserData(user.id, data);
            await i.reply({ content: `✅ Compraste **${item.nombre}**.`, ephemeral: true });
        });
    }
};
