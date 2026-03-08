const { EmbedBuilder } = require('discord.js');
const { User } = require('../economyManager.js'); 

module.exports = {
    name: 'top',
    aliases: ['leaderboard', 'mejores'],
    async execute(message) {
        // 1. Obtener los 10 usuarios con más flores de MongoDB
        const topUsers = await User.find().sort({ wallet: -1 }).limit(10);

        let description = "";
        
        for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            // Buscamos al miembro en el servidor para obtener su APODO
            const member = message.guild.members.cache.get(userData.userId);
            const name = member ? member.displayName : "Usuario Desconocido";
            
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "✨";
            description += `${medal} **${name}** — 🌸 \`${userData.wallet.toLocaleString()}\` flores\n`;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🏆 Top Flores: ${message.guild.name}`, 
                iconURL: message.guild.iconURL({ dynamic: true }) 
            })
            .setDescription(description || "¡Aún no hay nadie en el ranking! ☁️")
            .setColor('#FFB6C1')
            // GIF Aesthetic de un gatito celebrando con flores/confeti
            .setThumbnail('https://i.pinimg.com/originals/c1/9a/31/c19a311894a87a6d80c3546738491763.gif')
            .setFooter({ text: '¿Podrás llegar al primer lugar? 🎀' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};