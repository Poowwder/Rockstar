const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wave',
    description: 'Saluda a alguien con la mano 👋',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `👋 **${message.author.username}** está saludando a **${user.username}**... ¡Hola, hola! ✨` : `👋 **${message.author.username}** está saludando a todos... ¡Qué linda! ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/mS2Q-2u5f_YAAAAC/anime-wave.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};