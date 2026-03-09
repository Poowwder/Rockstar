const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'tickle',
    description: '¡Hazle cosquillas a alguien hasta que no pueda más! 😂',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 ¿A quién le harás cosquillas hoy? ✨");
        const res = await fetch('https://nekos.life/api/v2/img/tickle');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`😂 **${message.author.username}** le hace cosquillas a **${user.username}**... ¡Qué risa! 🎀`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};