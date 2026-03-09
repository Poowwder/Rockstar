const ms = require('ms');

module.exports = {
    name: 'slowmode',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageChannels')) return message.reply('🌸 Sin permisos.');
        const time = args[0];
        if (!time) return message.reply('🌸 Indica el tiempo (ej: 10s, 1m) o 0 para quitar.');
        
        const seconds = time === '0' ? 0 : ms(time) / 1000;
        await message.channel.setRateLimitPerUser(seconds);
        message.reply(`✅ Modo lento: **${time === '0' ? 'Desactivado' : time}**. ✨`);
    }
};