const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dodge',
    description: '¡Esquiva un ataque o un abrazo no deseado! 💨',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`💨 **${message.author.username}** lo esquivó con estilo... ¡No me toques, reina! ✨`)
            .setImage("https://media.tenor.com/v8v8v8v8v8vAAAAC/anime-dodge.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};