const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yeet',
    description: '¡Lanza a alguien por los aires! 🚀',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién quieres lanzar lejos? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🚀 **${message.author.username}** hizo un YEET con **${user.username}**... ¡Hasta la vista! 🌸`)
            .setImage("https://media.tenor.com/y3y3y3y3y3yAAAAC/anime-yeet.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};