const { EmbedBuilder } = require('discord.js');
const { User } = require('../economyManager.js'); 

module.exports = {
    name: 'top',
    aliases: ['leaderboard', 'lb', 'activos'],
    async execute(message) {
        // Ordenamos por nivel y luego por experiencia
        const topUsers = await User.find().sort({ level: -1, xp: -1 }).limit(10);

        let description = "*“Las estrellitas que más brillan en nuestro cielo...”* ✨\n\n";
        description += "୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n";
        
        if (topUsers.length === 0) {
            description += "╰┈➤ ☁️ *¡Aún no hay estrellas hoy!*";
        } else {
            for (let i = 0; i < topUsers.length; i++) {
                const userData = topUsers[i];
                const member = message.guild.members.cache.get(userData.userId);
                const name = member ? member.displayName : "Estrella Fugaz";
                
                // Iconos Coquette para el Top
                const icon = i === 0 ? "👑" : i === 1 ? "⭐" : i === 2 ? "✨" : "🎀";
                
                description += `${icon} **${name}**\n╰┈➤ \`Nivel ${userData.level || 1}\` ‧ \`${(userData.xp || 0).toLocaleString()} XP\` 🌸\n\n`;
            }
        }

        description += "୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧";

        const topEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `🏆 Hall de la Fama: ${message.guild.name}`, 
                iconURL: message.guild.iconURL({ dynamic: true }) 
            })
            .setColor('#CDB4DB') // Lila Pastel
            .setThumbnail('https://i.pinimg.com/originals/11/be/f3/11bef32f170ef563391786c5f782c58a.gif')
            .setDescription(description)
            .setImage('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setFooter({ text: '¡Gracias por llenar de vida el servidor! ♡', iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [topEmbed] });
    }
};