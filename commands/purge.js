module.exports = {
    name: 'purge',
    aliases: ['clear'],
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('🌸 Sin permisos.');
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('🌸 Pon un número del 1 al 100.');

        await message.channel.bulkDelete(amount, true);
        message.channel.send(`✅ Se han borrado **${amount}** mensajes. ✨`).then(m => setTimeout(() => m.delete(), 3000));
    }
};