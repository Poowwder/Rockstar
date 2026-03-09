const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'laugh',
    description: '¡Ríete a carcajadas! ✨',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** no puede parar de reír... ¡Qué alegría! 🌸`)
            .setImage("https://media.tenor.com/T_7kM_88v7MAAAAC/anime-laugh.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};