module.exports = {
    name: 'mute',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) return message.reply('🌸 No puedes usar esto.');
        const user = message.mentions.members.first();
        if (!user) return message.reply('🌸 Menciona a un usuario.');
        
        let muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) {
            muteRole = await message.guild.roles.create({ name: 'Muted', color: '#000000' });
            message.guild.channels.cache.forEach(ch => ch.permissionOverwrites.create(muteRole, { SendMessages: false }).catch(() => {}));
        }

        await user.roles.add(muteRole);
        message.reply(`✅ **${user.user.tag}** ha sido silenciado. ✨`);
    }
};