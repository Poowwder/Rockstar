const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cringe',
    description: 'Cuando alguien dice algo que da mucha vergüenza... 😬',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😬 **${message.author.username}** sintió un poquito de cringe... ✨`)
            .setImage("https://media.tenor.com/7p6p6p6p6p6AAAAC/anime-cringe.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};