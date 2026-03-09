const fs = require('fs');
const path = require('path');
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'warn',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 No tienes permisos.');
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ');
        if (!user || !reason) return message.reply('🌸 Uso: `!!warn @usuario [razón]`');

        let warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        if (!warns[message.guild.id]) warns[message.guild.id] = {};
        if (!warns[message.guild.id][user.id]) warns[message.guild.id][user.id] = [];

        warns[message.guild.id][user.id].push({ id: Date.now().toString(36), reason, mod: message.author.id });
        fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));

        message.reply(`✅ Advertencia aplicada a **${user.tag}**. ✨`);
    }
};