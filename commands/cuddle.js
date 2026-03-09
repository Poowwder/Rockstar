const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'cuddle',
    description: 'Acurrúcate con alguien muy lindo 🎀',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿Con quién te quieres acurrucar hoy? ✨");
        const res = await fetch('https://nekos.life/api/v2/img/cuddle');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`🎀 **${message.author.username}** se acurrucó con **${user.username}**... Se ven tan bien juntos. ✨`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};