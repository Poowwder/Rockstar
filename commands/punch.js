const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'punch',
    description: '¡Dale un buen golpe a alguien! 👊',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién le vas a pegar, reina? ✨");
        const embed = new EmbedBuilder()
            .setDescription(`👊 **${message.author.username}** le dio un puñetazo a **${user.username}**... ¡Eso tuvo que doler! 🎀`)
            .setImage("https://media.tenor.com/6a47ls6CKYQAAAAC/anime-punch.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};