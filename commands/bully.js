const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bully',
    description: 'Molesta un poquito a tus amigos 😈',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién vas a molestar hoy? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`😈 **${message.author.username}** le está haciendo bully a **${user.username}**... ¡Qué mala! 🎀`)
            .setImage("https://media.tenor.com/p9p9p9p9p9pAAAAC/anime-bully.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};