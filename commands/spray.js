const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'spray',
    description: 'Rocía a alguien con spray (¡o perfume!) ✨',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user 
            ? `✨ **${message.author.username}** roció a **${user.username}**... ¡Ahora huele delicioso! 🌸` 
            : `✨ **${message.author.username}** está rociando un poco de aroma en el aire... ¡Qué refrescante! 🎀`;
        
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/T-3y2vK9e84AAAAC/anime-spray.gif")
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};