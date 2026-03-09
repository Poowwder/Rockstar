const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clap',
    description: '¡Dale un aplauso a alguien por su gran trabajo! 👏',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `👏 **${message.author.username}** le aplaude a **${user.username}**... ¡Bravo, bravo! ✨` : `👏 **${message.author.username}** está aplaudiendo... ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/S6M_H9N_p6oAAAAC/anime-clap.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};