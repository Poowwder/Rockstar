const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { deleteShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'rmitem',
    async execute(message, args) {
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        if (!args[0]) return message.reply("╰┈➤ ❌ Indica el **nombre** o la **ID** del objeto que deseas desterrar de la tienda.");

        // 🔮 MAGIA AUTOMÁTICA: Convierte lo que escribas en la ID correcta (igual que en additem)
        const rawInput = args.join(' ');
        const id = rawInput.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes y eñes
            .replace(/[^a-z0-9]/g, '_') // Cambia espacios por guiones bajos
            .replace(/_+/g, '_'); // Limpia guiones dobles

        await deleteShopItemDB(id);
        
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setDescription(
                `> ✨ **Mercado de las Sombras Actualizado**\n` +
                `> ╰┈➤ El objeto \`${id}\` ha sido consumido por la oscuridad.\n` +
                `> ╰┈➤ *Ya no aparecerá en el catálogo fijo.*`
            );
        
        message.reply({ embeds: [embed] });
    }
};
