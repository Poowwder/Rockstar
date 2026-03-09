const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'kiss',
    description: 'Dale un besito aesthetic a alguien 💖',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Menciona a tu personita especial para darle un beso. ✨");

        const res = await fetch('https://nekos.life/api/v2/img/kiss');
        const json = await res.json();

        const embed = new EmbedBuilder()
            .setDescription(`💖 **${message.author.username}** le dio un beso a **${user.username}**... ¡El amor está en el aire! ✨`)
            .setImage(json.url)
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};