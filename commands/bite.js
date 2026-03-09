const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bite',
    description: 'Dale una mordidita a alguien 🦷',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién quieres morder, linda? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🦷 **${message.author.username}** le dio una mordida a **${user.username}**... ¡Auch! 🎀`)
            .setImage("https://media.tenor.com/noV4m_In6v4AAAAC/anime-bite.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};