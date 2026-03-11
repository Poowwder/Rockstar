const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { updateShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'additem',
    description: 'Añade un objeto al Mercado de las Sombras.',
    category: 'administración',
    async execute(message, args) {
        // --- 🛡️ CONTROL DE ACCESO ---
        const hasRole = message.member.roles.cache.some(r => r.name.toLowerCase() === 'shop');
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) return;

        // --- 📝 VALIDACIÓN DE ARGUMENTOS ---
        // Uso: !!additem <emoji> <precio> <categoría> <nombre>
        if (args.length < 4) {
            return message.reply({
                content: "╰┈➤ ❌ **Error de formato.**\n> Uso: `!!additem <emoji> <precio> <categoría> <nombre>`\n> *Ejemplo: !!additem ⛏️ 3000 Herramientas Pico de Diamante*"
            });
        }

        const emoji = args[0];
        const precio = parseInt(args[1]);
        const categoria = args[2].toUpperCase(); // Se guarda en mayúsculas para los títulos de la tienda
        const nombre = args.slice(3).join(' ');

        if (isNaN(precio)) return message.reply("╰┈➤ ❌ El precio debe ser un número válido.");

        // --- 🔮 GENERADOR DE ID AUTOMÁTICO ---
        const id = nombre.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes
            .replace(/[^a-z0-9]/g, '_') // Cambia caracteres raros por guiones
            .replace(/_+/g, '_'); // Limpia guiones dobles

        // --- 💾 GUARDADO EN BASE DE DATOS ---
        try {
            await updateShopItemDB(id, { 
                id, 
                name: nombre, 
                emoji, 
                price: precio, 
                tipo: "fijo", 
                categoria: categoria 
            });

            // --- 📄 EMBED DE CONFIRMACIÓN ---
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setTitle('✨ Registro de Mercancía Exitoso')
                .setDescription(
                    `> Un nuevo objeto ha sido vinculado al Mercado de las Sombras.\n\n` +
                    `╰┈➤ **Objeto:** ${emoji} ${nombre}\n` +
                    `╰┈➤ **Sección:** \`${categoria}\`\n` +
                    `╰┈➤ **Valor:** \`${precio.toLocaleString()}\` flores 🌸\n` +
                    `╰┈➤ **ID Asignada:** \`${id}\``
                )
                .setFooter({ text: 'Rockstar Economy ⊹ Gestión de Inventario' });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error al añadir item:", error);
            message.reply("╰┈➤ ❌ Hubo un fallo al contactar con la base de datos.");
        }
    }
};
