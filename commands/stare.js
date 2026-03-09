const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stare',
    description: 'Quédate viendo fijamente a alguien... 👀',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `👀 **${message.author.username}** se le quedó viendo fijamente a **${user.username}**... ✨` : `👀 **${message.author.username}** está observando... ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/mF9mIDvN-m0AAAAC/anime-stare.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};