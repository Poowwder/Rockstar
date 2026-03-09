const ms = require('ms');

module.exports = {
    name: 'timeout',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 Sin permisos.');
        const member = message.mentions.members.first();
        const time = args[1];
        if (!member || !time) return message.reply('🌸 Uso: `!!timeout @usuario 1h`');

        const duration = ms(time);
        if (!duration) return message.reply('❌ Tiempo inválido.');

        await member.timeout(duration);
        message.reply(`✅ **${member.user.tag}** ha sido silenciado por **${time}**. ✨`);
    }
};