const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shrug',
    description: 'No tienes idea de qué está pasando 🤷‍♀️',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`🤷‍♀️ **${message.author.username}** no tiene idea... ¿Quién sabe? ✨`)
            .setImage("https://media.tenor.com/f7jYn_Ush88AAAAC/anime-shrug.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};