const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser) {
        // Verificamos si realmente cambió la identidad visual (avatar)
        if (oldUser.avatar === newUser.avatar) return;

        // Buscamos los dominios (servidores) que comparten el usuario y el bot
        const mutualGuilds = newUser.client.guilds.cache.filter(g => g.members.cache.has(newUser.id));

        // Notificamos a todos los servidores compartidos usando un bucle seguro
        for (const guild of mutualGuilds.values()) {
            await sendAuditLog(guild, {
                title: '⊹ Identidad Visual Alterada ⊹',
                description: 
                    `**Sujeto:** ${newUser.tag}\n\n` +
                    `> *El individuo ha actualizado su apariencia en los registros del sistema.*`,
                color: '#1a1a1a', // Negro Rockstar
                image: newUser.displayAvatarURL({ dynamic: true, size: 512 }), // 📸 Foto en máxima calidad
                icon: newUser.displayAvatarURL({ dynamic: true })
            });
        }
    }
};
