const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'spank',
    description: 'Un pequeño azote para alguien que se portó mal... 🍑',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Menciona a alguien para darle su merecido. ✨");
        const embed = new EmbedBuilder()
            .setDescription(`🍑 **${message.author.username}** le dio un azote a **${user.username}**... ¡Para que aprendas! 💢`)
            .setImage("https://media.tenor.com/mO_T-p-9P-oAAAAC/anime-spank.gif").setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};