const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'pat',
    description: 'Dale cariñitos en la cabeza a alguien ✨',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Menciona a alguien para darle cariñitos. ✨");
        const res = await fetch('https://nekos.life/api/v2/img/pat');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** le dio palmaditas a **${user.username}**... ¡Qué buen comportamiento! 🌸`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};