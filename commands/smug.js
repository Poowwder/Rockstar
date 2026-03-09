const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'smug',
    description: 'Pon una cara de presumida total 😏',
    async execute(message) {
        const res = await fetch('https://nekos.life/api/v2/img/smug');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`😏 **${message.author.username}** se siente muy superior hoy... ¡Esa actitud! 💍`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};