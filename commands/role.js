module.exports = {
    name: 'role',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageRoles')) return message.reply('🌸 Sin permisos.');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2] || args[1]);

        if (!member || !role) return message.reply('🌸 Uso: `!!role @usuario @rol`');
        if (role.position >= message.member.roles.highest.position) return message.reply('❌ No puedes gestionar un rol superior al tuyo.');

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            message.reply(`✅ Rol **${role.name}** quitado de **${member.user.tag}**. ✨`);
        } else {
            await member.roles.add(role);
            message.reply(`✅ Rol **${role.name}** añadido a **${member.user.tag}**. ✨`);
        }
    }
};