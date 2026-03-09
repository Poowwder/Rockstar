module.exports = {
    name: 'untimeout',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 Sin permisos.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('🌸 Menciona a alguien.');

        await member.timeout(null);
        message.reply(`✅ El timeout de **${member.user.tag}** ha sido removido. ✨`);
    }
};