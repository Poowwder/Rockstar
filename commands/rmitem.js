const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { deleteShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'rmitem',
    async execute(message, args) {
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        const id = args[0]?.toLowerCase();
        if (!id) return message.reply("╰┈➤ Indica el **ID** del objeto a retirar.");

        await deleteShopItemDB(id);
        
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setDescription(`🗑️ **Objeto Eliminado:** El ID \`${id}\` ya no aparecerá en la sección fija de la tienda.`);
        
        message.reply({ embeds: [embed] });
    }
};
