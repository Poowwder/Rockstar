const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'scared',
    description: '¡Muestra que tienes mucho miedo! 😨',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😨 **${message.author.username}** está muy asustada... ¡Alguien que la cuide! 🌸`)
            .setImage("https://media.tenor.com/7P7S9X9v_YAAAAC/anime-scared.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};