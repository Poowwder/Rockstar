const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'thinking',
    description: 'Muestra que estás pensando mucho algo 🤔',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`🤔 **${message.author.username}** está pensando seriamente... ✨`)
            .setImage("https://media.tenor.com/v_v_v_v_v_vAAAAC/anime-thinking.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};