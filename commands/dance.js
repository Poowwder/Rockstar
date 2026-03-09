const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dance',
    description: '¡Ponte a bailar con estilo! 💃',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`💃 **${message.author.username}** sacó sus mejores pasos... ¡Esa es mi reina! ✨`)
            .setImage("https://media.tenor.com/u_f669S8X78AAAAC/anime-dance.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};