const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'blush',
    description: 'Muéstrate sonrojada y cute 😳',
    async execute(message) {
        const res = await fetch('https://nekos.life/api/v2/img/smug'); // Smug/Blush estilo anime
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`😳 **${message.author.username}** se ha sonrojado mucho... ¡Qué linda te ves! ✨`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};