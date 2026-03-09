module.exports = {
    name: 'unmute',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 No puedes usar esto.');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('🌸 Menciona a un usuario.');

        const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole || !member.roles.cache.has(muteRole.id)) return message.reply('❌ El usuario no está silenciado.');

        await member.roles.remove(muteRole);
        message.reply(`✅ **${member.user.tag}** ya puede hablar de nuevo. ✨`);
    }
};