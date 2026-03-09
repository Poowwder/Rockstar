const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'happy',
    description: 'Muestra lo feliz que estás hoy ✨',
    async execute(message) {
        // Usando un link directo aesthetic si no quieres depender de APIs externas para todo
        const gifs = [
            "https://media.tenor.com/S96p6K3mY6AAAAAC/anime-happy.gif",
            "https://media.tenor.com/0uB0C39U7mAAAAAC/anime-girl-happy.gif"
        ];
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setDescription(`✨ **${message.author.username}** está irradiando felicidad hoy... ¡Qué linda! 🌸`)
            .setImage(randomGif)
            .setColor('#FFB7C5');

        await message.reply({ embeds: [embed] });
    }
};