const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'graffiti',
    aliases: ['paint', 'esprintar'],
    description: '¡Deja tu marca con un graffiti aesthetic! 🎨',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user 
            ? `🎨 **${message.author.username}** llenó de pintura a **${user.username}**... ¡Eres su nuevo graffiti favorito! ✨` 
            : `🎨 **${message.author.username}** sacó sus latas de pintura y pintó un graffiti de Rockstar increíble. 🌸`;

        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/6_GfN_lX9v8AAAAC/anime-graffiti.gif")
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};