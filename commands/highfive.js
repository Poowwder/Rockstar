const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'highfive',
    description: 'Choca esos cinco con alguien 🖐️',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¡Choca esos cinco con alguien! Menciona a un amigo. ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🖐️ **${message.author.username}** y **${user.username}** chocaron esos cinco... ¡Buen trabajo! 🌸`)
            .setImage("https://media.tenor.com/97y04VfB3k4AAAAC/anime-high-five.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};