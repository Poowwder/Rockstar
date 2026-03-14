const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { deleteShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'rmitem',
    async execute(message, args) {
        // Validación de permisos o rol 'shop'
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        if (!args[0]) return message.reply("╰┈➤ ❌ Indica el **nombre** o la **ID** del objeto que deseas desterrar de la tienda.");

        const rawInput = args.join(' ');
        
        // 🔮 MAGIA CORREGIDA: 
        // Pasa a minúsculas y cambia espacios por guiones bajos, PERO respeta la 'ñ' intacta.
        const id = rawInput.toLowerCase().replace(/\s+/g, '_'); 

        try {
            // Mandamos la orden al núcleo de la base de datos
            await deleteShopItemDB(id);
            
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a') // Negro Rockstar
                .setDescription(
                    `> ✨ **Mercado de las Sombras Actualizado**\n` +
                    `> ╰┈➤ El objeto \`${id}\` ha sido consumido por la oscuridad.\n` +
                    `> ╰┈➤ *Ya no aparecerá en el catálogo fijo.*`
                );
            
            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error al borrar item:", error);
            message.reply("╰┈➤ ❌ El abismo rechazó la petición. Ocurrió un error en la base de datos.");
        }
    }
};
