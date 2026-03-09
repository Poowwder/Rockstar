const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'angry',
    description: 'Muestra que estás muy enojada 💢',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setDescription(`💢 **${message.author.username}** está muy molesta... ¡Mejor dásle su espacio! ✨`)
            .setImage("https://media.tenor.com/p_pU8-M79XgAAAAC/anime-angry.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};