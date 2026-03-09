const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pout',
    description: 'Hazle un puchero a alguien 😤',
    async execute(message, args) {
        const user = message.mentions.users.first();
        const desc = user ? `😤 **${message.author.username}** le hace un puchero a **${user.username}**... ¡Alguien está molesta! ✨` : `😤 **${message.author.username}** está haciendo un puchero... ✨`;
        const embed = new EmbedBuilder()
            .setDescription(desc)
            .setImage("https://media.tenor.com/796E5pXfN38AAAAC/anime-pout.gif")
            .setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};