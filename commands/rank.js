const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'rank',
    aliases: ['lvl', 'nivel'],
    async execute(message) {
        const target = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);

        const currentLevel = data.level || 1;
        const currentXP = data.xp || 0;
        const nextLevelXP = currentLevel * 500;
        const percent = Math.min(Math.floor((currentXP / nextLevelXP) * 100), 100);

        // 🌸 BARRA DE PROGRESO CUTE
        const progress = "🌸".repeat(Math.floor(percent / 10)) + "🤍".repeat(10 - Math.floor(percent / 10));

        const rankEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ ✨ Tu Nivel Rockstar ✨ ˚₊‧`)
            .setColor('#FFB6C1') // Rosa Pastel
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                `*“Cada mensaje es un destello de tu magia...”* 🎀\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `⭐ **Nivel:** \`${currentLevel}\`\n` +
                `✨ **XP:** \`${currentXP.toLocaleString()} / ${nextLevelXP.toLocaleString()}\`\n` +
                `📊 **Progreso:** \`${percent}%\` \n` +
                `╰┈➤ ${progress}\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Sigue brillando, ${member.displayName}!* 🚀`
            )
            .setFooter({ text: `Estrella: ${member.displayName} ♡`, iconURL: 'https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif' });

        return message.reply({ embeds: [rankEmbed] });
    }
};