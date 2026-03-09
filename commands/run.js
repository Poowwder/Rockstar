const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'run',
    description: '¡Huye de la situación! 🏃‍♀️',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`🏃‍♀️ **${message.author.username}** salió corriendo... ¡No la atraparán! ✨`)
            .setImage("https://media.tenor.com/N6N6N6N6N6NAAAAC/anime-run.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};