const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nom',
    description: '¡A comer se ha dicho! 😋',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`😋 **${message.author.username}** está disfrutando de algo delicioso... ¡Nom nom! 🌸`)
            .setImage("https://media.tenor.com/M_R59G6Y-WkAAAAC/anime-eat.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};