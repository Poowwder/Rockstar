const fs = require('fs');
const path = require('path');
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'unwarn',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 No tienes permisos.');
        const user = message.mentions.users.first();
        const warnId = args[1];
        if (!user || !warnId) return message.reply('🌸 Uso: `!!unwarn @usuario [ID_del_warn]`');

        let warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        if (warns[message.guild.id]?.[user.id]) {
            warns[message.guild.id][user.id] = warns[message.guild.id][user.id].filter(w => w.id !== warnId);
            fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));
            message.reply(`✅ Warn \`${warnId}\` removido de **${user.tag}**. ✨`);
        } else {
            message.reply('❌ No se encontraron advertencias para ese usuario.');
        }
    }
};