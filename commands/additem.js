const { EmbedBuilder } = require('discord.js');
const { updateShopItemDB } = require('../userManager.js');

module.exports = {
    name: 'additem',
    description: '🛠️ Añade un objeto a la tienda global.',
    async execute(message, args) {
        // Solo administradores
        if (!message.member.permissions.has('Administrator')) return;

        const emoji = args[0];
        const price = parseInt(args[1]);
        const categoria = args[2]?.toUpperCase();
        const nombre = args.slice(3).join(' '); // Captura nombres con espacios

        if (!emoji || isNaN(price) || !categoria || !nombre) {
            return message.reply({ 
                content: "╰┈➤ ❌ **Error de formato.**\n> Uso: `!!additem <emoji> <precio> <categoría> <nombre>`\n> Ejemplo: `!!additem ⛏️ 3000 Herramientas Pico de Hierro`" 
            });
        }

        // Creamos una ID única basada en el nombre
        const id = nombre.toLowerCase().replace(/ /g, '_');

        const success = await updateShopItemDB(id, {
            id: id,
            name: nombre,
            emoji: emoji,
            price: price,
            categoria: categoria
        });

        if (success) {
            const embed = new EmbedBuilder()
                .setTitle('✨ Objeto Registrado')
                .setColor('#1a1a1a')
                .setDescription(`Se ha añadido **${nombre}** a la categoría **${categoria}**.`)
                .addFields(
                    { name: '💰 Precio', value: `${price} 🌸`, inline: true },
                    { name: '🆔 ID Interna', value: `\`${id}\``, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Rockstar ⊹ Store Manager' });

            return message.reply({ embeds: [embed] });
        } else {
            return message.reply("❌ Hubo un fallo al contactar con la base de datos.");
        }
    }
};
