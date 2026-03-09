const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'handhold',
    description: 'Tómale la mano a alguien de forma romántica 💍',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién le quieres tomar la mano? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`💍 **${message.author.username}** tomó la mano de **${user.username}**... ¡Qué momento tan lindo! 🌸`)
            .setImage("https://media.tenor.com/9v6v9vXv9v8AAAAC/anime-hand-hold.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};