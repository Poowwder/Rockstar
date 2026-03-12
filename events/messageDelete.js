const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        console.log(`[🔍 DEBUG DELETE] Evento disparado en el canal: ${message.channel?.name || 'Desconocido'}`);

        if (message.author?.bot) {
            console.log(`[🔍 DEBUG DELETE] Ignorado: El autor era un ente mecánico (Bot).`);
            return;
        }

        if (message.partial) {
            console.log(`[🔍 DEBUG DELETE] El mensaje borrado era parcial (fuera de caché). Preparando log...`);
            return await sendAuditLog(message.guild, {
                title: '⊹ Evidencia Antigua Eliminada ⊹',
                description: 
                    `**Sector:** ${message.channel}\n` +
                    `**ID del Mensaje:** \`${message.id}\`\n` +
                    `> *Las sombras devoraron un mensaje antiguo. Su contenido original se ha perdido en el vacío.*`,
                color: '#ff4d4d'
            });
        }

        console.log(`[🔍 DEBUG DELETE] Mensaje en caché detectado. Autor: ${message.author?.tag}. Preparando log...`);
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
