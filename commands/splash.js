const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'splash',
    description: '¡Moja a alguien con un buen Splash! 💦',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién quieres empapar con agua, linda? ✨");
        
        const embed = new EmbedBuilder()
            .setDescription(`💦 **${message.author.username}** le lanzó un cubetazo de agua a **${user.username}**... ¡Quedó empapado! 🎀`)
            .setImage("https://media.tenor.com/7SjL7XNInm0AAAAC/anime-water.gif")
            .setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};