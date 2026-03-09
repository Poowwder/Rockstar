module.exports = {
    name: 'nick',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageNicknames')) return message.reply('🌸 Sin permisos.');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('🌸 Menciona a alguien.');
        
        // Si no hay más argumentos, reseteamos el nick
        const newNick = args.slice(1).join(' ') || null;
        if (!member.manageable) return message.reply('❌ No puedo modificar a este usuario.');

        await member.setNickname(newNick);
        message.reply(newNick ? `✅ Apodo de **${member.user.tag}** cambiado a **${newNick}**. ✨` : `✅ Apodo de **${member.user.tag}** restablecido. ✨`);
    }
};