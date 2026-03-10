const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');
const { UserProfile } = require('../data/mongodb.js'); // Importamos para sincronizar Nyx
const { checkNekos } = require('../functions/checkNekos.js');

module.exports = {
    name: 'rank',
    aliases: ['lvl', 'nivel'],
    category: 'información',
    async execute(message) {
        const target = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(target.id) || { displayName: target.username };
        const data = await getUserData(target.id);

        const currentLevel = data.level || 1;
        const currentXP = data.xp || 0;
        const nextLevelXP = currentLevel * 500;
        const percent = Math.min(Math.floor((currentXP / nextLevelXP) * 100), 100);

        // --- Sincronización con el sistema de Nekos (Nyx) ---
        // Actualizamos el nivel en el perfil de MongoDB para que checkNekos sepa cuando dar a Nyx
        await UserProfile.findOneAndUpdate(
            { UserID: target.id, GuildID: message.guild.id },
            { Level: currentLevel },
            { upsert: true }
        );

        // Si el usuario es quien ejecuta el comando, verificamos si desbloqueó a Nyx
        if (target.id === message.author.id) {
            await checkNekos(message, 'levelUp');
        }

        // 🌸 BARRA DE PROGRESO CUTE
        const progress = "🌸".repeat(Math.floor(percent / 10)) + "🤍".repeat(10 - Math.floor(percent / 10));

        const rankEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ ✨ Nivel Rockstar ✨ ˚₊‧`)
            .setColor('#FFB6C1')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                `*“Cada mensaje es un destello de tu magia...”* 🎀\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n` +
                `⭐ **Nivel:** \`${currentLevel}\`\n` +
                `✨ **XP:** \`${currentXP.toLocaleString()} / ${nextLevelXP.toLocaleString()}\`\n` +
                `📊 **Progreso:** \`${percent}%\` \n` +
                `╰┈➤ ${progress}\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n\n` +
                `*¡Todo el brillo para ${member.displayName}!* 🚀`
            )
            .setFooter({ 
                text: `Estrella: ${member.displayName} ♡`, 
                iconURL: 'https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif' 
            });

        return message.reply({ embeds: [rankEmbed] });
    }
};