const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hi',
    aliases: ['hello', 'hola'],
    description: '¡Saluda a todos con mucha energía! ✨',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** dice: ¡Hola a todos, personitas lindas! 🌸`)
            .setImage("https://media.tenor.com/7P7S9X9v_YAAAAC/anime-wave.gif")
            .setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};