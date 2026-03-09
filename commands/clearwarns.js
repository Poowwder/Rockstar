const fs = require('fs');
const path = require('path');
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'clearwarns',
    description: 'Borra todo el historial de advertencias de un usuario.',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 No tienes permisos.');
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('🌸 Menciona al usuario para limpiar su historial.');

        let warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');

        if (warns[message.guild.id] && warns[message.guild.id][user.id]) {
            warns[message.guild.id][user.id] = [];
            fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));
            message.reply(`✅ El historial de **${user.tag}** ha sido borrado por completo. ✨`);
        } else {
            message.reply('❌ Este usuario no tiene advertencias registradas.');
        }
    }
};