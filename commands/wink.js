const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wink',
    description: 'Guiñale el ojo a alguien con estilo 😉',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `😉 **${message.author.username}** le guiñó el ojo a **${user.username}**... ¡Qué coqueta! ✨` : `😉 **${message.author.username}** lanzó un guiño... ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/vPvPvPvPvPyAAAAC/anime-wink.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};