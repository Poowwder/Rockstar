const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sip',
    description: 'Toma un traguito de tu bebida favorita ☕',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`☕ **${message.author.username}** está bebiendo algo... ¡Salud, reina! ✨`)
            .setImage("https://media.tenor.com/Y1Y2Y3Y4Y5YAAAAC/anime-sip.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};