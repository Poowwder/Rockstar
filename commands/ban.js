const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Banea a un usuario del servidor.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('🌸 No tienes permisos.');
        const user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        if (!user) return message.reply('🌸 Menciona a alguien o pon su ID.');
        const reason = args.slice(1).join(' ') || 'Sin razón especificada';
        const member = message.guild.members.cache.get(user.id);

        if (member && message.member.roles.highest.position <= member.roles.highest.position) return message.reply('❌ Jerarquía insuficiente.');
        
        await message.guild.members.ban(user, { reason });
        message.reply(`✅ **${user.tag}** ha sido baneado. ✨`);
    }
};