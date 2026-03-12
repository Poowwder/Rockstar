const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // Ignoramos a otros bots para no generar spam infinito
        if (message.author?.bot) return;

        // Si el mensaje es muy antiguo (enviado antes de que el bot se encendiera)
        // Discord no nos dará el contenido, pero sí sabemos dónde se borró.
        if (message.partial) {
            return await sendAuditLog(message.guild, {
                title: '⊹ Evidencia Antigua Eliminada ⊹',
                description: 
                    `**Sector:** ${message.channel}\n` +
                    `**ID del Mensaje:** \`${message.id}\`\n` +
                    `> *Las sombras devoraron un mensaje antiguo. Su contenido original se ha perdido en el vacío.*`,
                color: '#ff4d4d' // Rojo de alerta
            });
        }

        // Si el mensaje estaba en la memoria caché del bot, revelamos su contenido
        await sendAuditLog(message.guild, {
            title: '⊹ Evidencia Eliminada ⊹',
            description: 
                `**Autor:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                `**Sector:** ${message.channel}\n\n` +
                `**Contenido Borrado:**\n\`\`\`${message.content || '[Contenido inaccesible o multimedia]'}\`\`\`\n` +
                `> *Un rastro ha sido borrado, pero el sistema no olvida.*`,
            color: '#ff4d4d',
            icon: message.author.displayAvatarURL({ dynamic: true })
        });
    }
};
