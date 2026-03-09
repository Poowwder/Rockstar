const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: 'poke',
    description: 'Pica a alguien con el dedo para llamar su atención 👉',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) return message.reply("🌸 Tienes que picar a alguien, reina. ✨");
        const res = await fetch('https://nekos.life/api/v2/img/poke');
        const json = await res.json();
        const embed = new EmbedBuilder()
            .setDescription(`👉 **${message.author.username}** está picando a **${user.username}**... ¡Hey, hazle caso! 🌸`)
            .setImage(json.url).setColor('#FFB7C5');
        await message.reply({ embeds: [embed] });
    }
};