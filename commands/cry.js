const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'cry',
    description: 'Muestra que estás triste 💧',
    async execute(message) {
        const res = await fetch('https://nekos.life/api/v2/img/cry');
        const json = await res.json();

        const embed = new EmbedBuilder()
            .setDescription(`💧 **${message.author.username}** está llorando... ¡Alguien dele un abrazo! 🥺`)
            .setImage(json.url)
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};