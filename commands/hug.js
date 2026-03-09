const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'hug',
    description: 'Dale un abrazo súper cálido a alguien ✨',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¡Tienes que mencionar a alguien para abrazar, linda! ✨");

        const res = await fetch('https://nekos.life/api/v2/img/hug');
        const json = await res.json();

        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** abrazó muy fuerte a **${user.username}**... ¡Qué ternura! 🎀`)
            .setImage(json.url)
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};