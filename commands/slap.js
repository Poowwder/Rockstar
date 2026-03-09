const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'slap',
    description: 'Dale una cachetada a alguien 💢',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Tienes que mencionar a alguien para darle un correctivo, linda. ✨");
        const res = await fetch('https://nekos.life/api/v2/img/slap');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`💢 **${message.author.username}** le dio una cachetada a **${user.username}**... ¡Eso dolió! 🎀`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};