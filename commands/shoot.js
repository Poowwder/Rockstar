const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shoot',
    description: '¡Pium pium! Dispárale a alguien (estilo anime) 🔫',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién le quieres disparar, reina? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🔫 **${message.author.username}** le disparó a **${user.username}**... ¡Directo al corazón! 🥀`)
            .setImage("https://media.tenor.com/6-y-6-y-6-yAAAAC/anime-shoot.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};