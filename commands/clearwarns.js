const fs = require('fs');
const path = require('path');
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'clearwarns',
    description: 'Borra todo el historial de advertencias de un usuario.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para purgar historiales en las sombras.');
        }
        
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('╰┈➤ ⚠️ Menciona al usuario cuyo expediente deseas limpiar.');
        }

        let warns = {};
        try {
            warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        } catch (e) {
            warns = {};
        }

        // --- 🗑️ PURGA DEL EXPEDIENTE ---
        if (warns[message.guild.id] && warns[message.guild.id][user.id] && warns[message.guild.id][user.id].length > 0) {
            warns[message.guild.id][user.id] = [];
            fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));
            message.reply(`╰┈➤ 🌑 El expediente de **${user.tag}** ha sido purgado por completo.`);
        } else {
            message.reply('╰┈➤ ❌ Este usuario no tiene antecedentes registrados en las sombras.');
        }
    }
};
