module.exports = {
    name: 'lock',
    async execute(message) {
        if (!message.member.permissions.has('ManageChannels')) return message.reply('🌸 Sin permisos.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply('✅ El canal ha sido bloqueado. 🔒✨');
    }
};