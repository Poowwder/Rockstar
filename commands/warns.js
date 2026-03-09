const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'warns',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        const userWarns = warns[message.guild.id]?.[user.id] || [];

        const embed = new EmbedBuilder()
            .setTitle(`Warns de ${user.tag} ✨`)
            .setColor('#FFB6C1')
            .setThumbnail(user.displayAvatarURL())
            .setDescription(userWarns.length ? userWarns.map(w => `🆔 \`${w.id}\` | **Razón:** ${w.reason}`).join('\n') : 'Este usuario no tiene advertencias. ✨');

        message.reply({ embeds: [embed] });
    }
};