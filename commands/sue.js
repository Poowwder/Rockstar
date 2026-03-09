const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sue',
    description: '¡Te veo en la corte! ⚖️',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `⚖️ **${message.author.username}** ha demandado a **${user.username}**... ¡Hablamos con mis abogados! ✨` : `⚖️ **${message.author.username}** va a demandar a alguien... ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/m2m2m2m2m2mAAAAC/anime-court.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};