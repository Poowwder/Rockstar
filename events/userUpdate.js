const { EmbedBuilder } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser) {
        // Verificamos si cambió el avatar
        if (oldUser.avatar === newUser.avatar) return;

        // Buscamos un servidor común donde esté el bot para enviar el log
        // (Ya que userUpdate no trae el objeto guild directamente)
        const guilds = newUser.client.guilds.cache.filter(g => g.members.cache.has(newUser.id));

        guilds.forEach(async (guild) => {
            await sendAuditLog(guild, {
                title: '⊹ Identidad Visual Alterada ⊹',
                description: 
                    `**Sujeto:** ${newUser.tag} (\`${newUser.id}\`)\n` +
                    `> *El individuo ha cambiado su apariencia en el registro central.*`,
                color: '#1a1a1a',
                thumbnail: newUser.displayAvatarURL({ dynamic: true }),
                image: newUser.displayAvatarURL({ dynamic: true, size: 512 }),
                icon: newUser.displayAvatarURL()
            });
        });
    }
};
