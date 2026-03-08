const { getUserData, updateUserData } = require('../economyManager.js');
const shopItems = require('../data/shop.json');

module.exports = {
    name: 'buy',
    aliases: ['comprar'],
    async execute(message, args) {
        const userId = message.author.id;
        
        // 1. Verificar si el usuario escribió qué quiere comprar
        if (!args.length) {
            return message.reply("✨ ¿Qué deseas comprar? Usa `!!buy [nombre]` (ej: `!!buy cafe`) o mira la `!!shop`.");
        }

        // Buscamos el item en el JSON (ignorando mayúsculas/minúsculas)
        const itemNameInput = args.join(" ").toLowerCase();
        const itemKey = Object.keys(shopItems).find(key => 
            shopItems[key].name.toLowerCase() === itemNameInput || key.toLowerCase() === itemNameInput
        );

        const item = shopItems[itemKey];

        if (!item) {
            return message.reply("❌ Ese objeto no parece estar en nuestra tienda. ¡Revisa bien el nombre! 🌸");
        }

        // 2. Obtener datos del usuario desde MongoDB
        let data = await getUserData(userId);
        if (!data) return message.reply("❌ Error al conectar con la base de datos.");

        // 3. Verificar si tiene dinero suficiente
        if (data.wallet < item.price) {
            const faltante = item.price - data.wallet;
            return message.reply(`😢 ¡Oh no! Te faltan **${faltante}** flores para comprar **${item.name}**. ¡Sigue trabajando! ✨`);
        }

        // 4. PROCESAR LA COMPRA
        // Restar dinero
        data.wallet -= item.price;

        // Añadir al inventario (Map de MongoDB)
        const cantidadActual = data.inventory.get(item.name) || 0;
        data.inventory.set(item.name, cantidadActual + 1);

        // 5. Guardar cambios en MongoDB
        await updateUserData(userId, data);

        // 6. Confirmación Aesthetic
        message.reply({
            embeds: [{
                title: "🛍️ ¡Compra Exitosa!",
                description: `Has comprado un **${item.name}** por **${item.price}** flores. \n\n✨ *¡Disfruta tu nueva adquisición!*`,
                color: 0xFFB6C1,
                thumbnail: { url: 'https://i.pinimg.com/originals/c2/93/90/c29390232491a92a54318c5750346857.gif' }, // GIF de compra/felicidad
                footer: { text: `Balance actual: ${data.wallet} flores` }
            }]
        });
    }
};