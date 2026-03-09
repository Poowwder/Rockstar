const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bye',
    aliases: ['adios', 'goodbye'],
    description: 'Despídete de forma aesthetic ✨',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** se tiene que ir... ¡Nos vemos pronto, reina! 🎀`)
            .setImage("https://media.tenor.com/UvYvUvYvUvYAAAAC/anime-bye.gif")
            .setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};