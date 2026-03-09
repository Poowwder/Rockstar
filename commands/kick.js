const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('🌸 No tienes permisos.');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('🌸 Menciona a alguien o pon su ID.');
        if (!member.kickable) return message.reply('❌ No puedo expulsar a este usuario.');
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply('❌ Jerarquía insuficiente.');

        const reason = args.slice(1).join(' ') || 'Sin razón especificada';
        await member.kick(reason);
        message.reply(`✅ **${member.user.tag}** ha sido expulsado. ✨`);
    }
};