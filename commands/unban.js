const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Desbanea a un usuario mediante su ID.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('🌸 No tienes permisos.');
        const userId = args[0];
        if (!userId) return message.reply('🌸 Proporciona la ID del usuario.');

        try {
            await message.guild.members.unban(userId);
            message.reply(`✅ Usuario con ID \`${userId}\` ha sido desbaneado. ✨`);
        } catch {
            message.reply('❌ No se encontró un baneo para esa ID.');
        }
    }
};