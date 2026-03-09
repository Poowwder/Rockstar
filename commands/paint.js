const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'paint',
    description: '¡Pinta un cuadro o a un amigo! 🖌️',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user 
            ? `🖌️ **${message.author.username}** está usando a **${user.username}** como lienzo... ¡Qué colorido! ✨` 
            : `🖌️ **${message.author.username}** se puso a pintar un cuadro súper aesthetic. 🌸`;

        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/xscbS6o9Ym8AAAAC/anime-painting.gif")
            .setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};