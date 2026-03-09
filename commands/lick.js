const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'lick',
    description: 'Dale una lamiidita a alguien... ¡Qué atrevida! 👅',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién quieres lamer, linda? ✨");
        const res = await fetch('https://nekos.life/api/v2/img/lick');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`👅 **${message.author.username}** le dio una lamida a **${user.username}**... ✨`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};