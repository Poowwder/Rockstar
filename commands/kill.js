const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kill',
    description: 'Elimina a alguien (estilo anime) 💀',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Menciona a tu víctima, reina. ✨");
        const embed = new EmbedBuilder()
            .setDescription(`💀 **${message.author.username}** acabó con **${user.username}**... ¡Qué miedo! 🥀`)
            .setImage("https://media.tenor.com/7I-K9V3X9V8AAAAC/anime-kill.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};