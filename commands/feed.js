const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'feed',
    description: 'Dale de comer algo rico a alguien 🍭',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Menciona a alguien para darle un bocadito. ✨");
        const res = await fetch('https://nekos.life/api/v2/img/feed');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`🍭 **${message.author.username}** está alimentando a **${user.username}**... ¡Aww! 🌸`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};