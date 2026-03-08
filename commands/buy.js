const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'buy',
    aliases: ['comprar'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('🛒 Compra un artículo de la tienda')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('Nombre del objeto')
                .setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        const args = !isSlash ? input.content.split(/ +/).slice(1) : null;
        const itemName = isSlash ? input.options.getString('item').toLowerCase() : args[0]?.toLowerCase();

        if (!itemName) return input.reply("╰┈➤ 🌸 Escribe qué quieres comprar. Ejemplo: `!!buy anillo`.");

        let data = await getUserData(user.id);
        
        // Definición de precios y lógica
        const store = {
            "anillo": { name: "Anillo de Compromiso", price: 10000 },
            "escudo": { name: "Escudo de Flores", price: 5000 },
            "vip": { name: "Pase VIP Rockstar", price: 50000 }
        };

        const item = store[itemName];
        if (!item) return input.reply("╰┈➤ ❌ Ese objeto no está en la boutique, linda.");

        if (data.wallet < item.price) {
            return input.reply(`╰┈➤ ❌ **${member.displayName}**, no tienes suficientes flores en mano. Te faltan \`${(item.price - data.wallet).toLocaleString()} 🌸\`.`);
        }

        // Lógica de inventario (asumiendo que tienes data.inventory como array)
        if (!data.inventory) data.inventory = [];
        
        data.wallet -= item.price;
        data.inventory.push(item.name);
        await updateUserData(user.id, data);

        const buyEmbed = new EmbedBuilder()
            .setTitle('🛍️ ¡Compra Realizada!')
            .setColor('#B5EAD7') // Verde pastel
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif') // Bolsa de compras cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `**${member.displayName}**, ¡qué buen gusto tienes!\n\n` +
                `╰┈➤ Compraste: **${item.name}**\n` +
                `╰┈➤ Pagaste: \`${item.price.toLocaleString()} 🌸\`\n\n` +
                `*¡Disfruta tu nueva adquisición!* ✨\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setTimestamp()
            .setFooter({ text: `Cliente: ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [buyEmbed] });
    }
};