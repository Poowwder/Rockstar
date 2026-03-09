module.exports = {
    name: 'unlock',
    async execute(message) {
        if (!message.member.permissions.has('ManageChannels')) return message.reply('🌸 Sin permisos.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
        message.reply('✅ El canal ha sido desbloqueado. 🔓✨');
    }
};