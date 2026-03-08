const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'inv',
    aliases: ['inventory', 'mochila'],
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const data = await getUserData(target.id);

        // Convertir el Map de MongoDB a una lista legible
        let itemsList = "";
        
        // El inventario en Mongo es un Map, así que usamos .entries()
        if (!data.inventory || data.inventory.size === 0) {
            itemsList = "¡Tu mochila está vacía! 🌸 Ve a minar o pescar.";
        } else {
            data.inventory.forEach((cantidad, item) => {
                itemsList += `**${item}** x${cantidad}\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventario de ${target.username}`)
            .setDescription(itemsList)
            .setColor('#FFB6C1')
            .setFooter({ text: 'Usa !!shop para comprar más cosas' });

        message.reply({ embeds: [embed] });
    }
};