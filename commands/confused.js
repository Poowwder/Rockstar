const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'confused',
    description: 'No entiendes nada de lo que pasa 🤔',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`🤔 **${message.author.username}** está confundida... ¿Eh? ✨`)
            .setImage("https://media.tenor.com/mF9mIDvN-m0AAAAC/anime-confused.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};