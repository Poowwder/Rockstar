const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sleep',
    description: 'Muestra que tienes mucho sueño 😴',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😴 **${message.author.username}** se ha quedado dormida... ¡Shhh, no la despierten! ✨`)
            .setImage("https://media.tenor.com/N6637U08_v0AAAAC/anime-sleep.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};