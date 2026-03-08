const { EmbedBuilder } = require('discord.js');
const { User } = require('../economyManager.js'); // Importamos el Modelo directamente

module.exports = {
    name: 'rank',
    aliases: ['top', 'leaderboard'],
    async execute(message) {
        // Buscar los 10 mejores en la base de datos
        const topUsers = await User.find().sort({ wallet: -1 }).limit(10);

        let description = "";
        
        for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const member = message.guild.members.cache.get(userData.userId);
            // Si el usuario está en el servidor usa su apodo, si no, "Usuario Desconocido"
            const name = member ? member.displayName : "Usuario Desconocido";
            
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "✨";
            description += `${medal} **${name}** — 🌸 \`${userData.wallet.toLocaleString()}\` flores\n`;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🏆 Top Flores de ${message.guild.name}`, 
                iconURL: message.guild.iconURL() 
            })
            .setDescription(description || "¡Aún no hay nadie en el ranking! ☁️")
            .setColor('#FFB6C1')
            // Thumbnail de un gatito celebrando con confeti
            .setThumbnail('https://i.pinimg.com/originals/11/be/f3/11bef32f170ef563391786c5f782c58a.gif')
            .setFooter({ text: '¿Podrás llegar al primer lugar? 🎀' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};