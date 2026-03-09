const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'panic',
    description: '¡Entra en pánico total! 😱',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😱 **${message.author.username}** está entrando en pánico... ¡Ayuda! ✨`)
            .setImage("https://media.tenor.com/x5x5x5x5x5xAAAAC/anime-panic.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};