const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { updateShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'additem',
    async execute(message, args) {
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        if (args.length < 4) return message.reply("╰┈➤ `!!additem <id> <emoji> <precio> <nombre>`");

        const id = args[0].toLowerCase();
        const emoji = args[1];
        const precio = parseInt(args[2]);
        const nombre = args.slice(3).join(' ');

        if (isNaN(precio)) return message.reply("❌ El precio debe ser un número.");

        await updateShopItemDB(id, { id, name: nombre, emoji, price: precio, tipo: "fijo" });
        
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setDescription(`✨ **Catálogo Actualizado:** ${emoji} **${nombre}** ha sido añadido a la sección fija por \`${precio}\` flores.`);
        
        message.reply({ embeds: [embed] });
    }
};
