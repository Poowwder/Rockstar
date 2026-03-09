const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'bonk',
    description: '¡Dale un martillazo a alguien! 🔨',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién vas a mandarle un bonk, linda? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🔨 **${message.author.username}** le dio un BONK a **${user.username}**... ¡Directo a la horny jail! 🎀`)
            .setImage("https://media.tenor.com/7161m1vP-o8AAAAC/anime-bonk.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};