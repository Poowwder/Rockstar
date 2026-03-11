const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { updateShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'additem',
    async execute(message, args) {
        // Verificación de permisos
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        // ✅ FIX: Ahora solo pide 3 datos. Adiós a las IDs manuales.
        if (args.length < 3) return message.reply("╰┈➤ ❌ Uso correcto: `!!additem <emoji> <precio> <nombre>`\n*Ejemplo:* `!!additem 🎣 2000 Caña de pescar`");

        const emoji = args[0];
        const precio = parseInt(args[1]);
        const nombre = args.slice(2).join(' '); // Todo lo demás será el nombre

        if (isNaN(precio)) return message.reply("╰┈➤ ❌ Las sombras exigen un número válido como precio.");

        // 🔮 MAGIA AUTOMÁTICA: Crea la ID usando el nombre
        // Ejemplo: "Caña de Pescar" -> "cana_de_pescar"
        const id = nombre.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes y eñes
            .replace(/[^a-z0-9]/g, '_') // Cambia espacios por guiones bajos
            .replace(/_+/g, '_'); // Limpia guiones dobles

        // Guardamos en la base de datos
        await updateShopItemDB(id, { id, name: nombre, emoji, price: precio, tipo: "fijo" });
        
        // Embed estético
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setDescription(
                `> ✨ **Mercado de las Sombras Actualizado**\n` +
                `> ╰┈➤ ${emoji} **${nombre}** ha sido añadido con éxito.\n` +
                `> ╰┈➤ **Valor:** \`${precio}\` flores 🌸\n` +
                `> ╰┈➤ *ID Interna asignada:* \`${id}\``
            );
        
        message.reply({ embeds: [embed] });
    }
};
