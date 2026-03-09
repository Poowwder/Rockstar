const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bored',
    description: 'Muestra que estás muy aburrida 😴',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😴 **${message.author.username}** se está muriendo de aburrimiento... ✨`)
            .setImage("https://media.tenor.com/8-zI5S_5eIAAAAAC/anime-bored.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};