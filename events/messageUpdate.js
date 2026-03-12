const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        // 1. Recuperación del abismo (si el mensaje estaba fuera de la caché)
        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch (error) {
                return; // Si ya no existe, abortamos en silencio
            }
        }
        
        // 2. Filtros de ruido
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        // 3. Formateo limpio del contenido (Sin enlaces, solo el texto puro)
        const contenidoAntes = oldMessage.content ? `\`\`\`\n${oldMessage.content}\n\`\`\`` : '`[Sin texto original]`';
        const contenidoDespues = newMessage.content ? `\`\`\`\n${newMessage.content}\n\`\`\`` : '`[Texto eliminado por completo]`';

        // 4. Manifiesto final enviado al canal de Logs
        await sendAuditLog(oldMessage.guild, {
            title: '⊹ Alteración de Mensaje ⊹',
            description: 
                `**Sujeto:** ${oldMessage.author.tag}\n` +
                `**Sector:** ${oldMessage.channel}\n\n` +
                `**Original:**\n${contenidoAntes}\n` +
                `**Modificado:**\n${contenidoDespues}\n\n` +
                `> *La realidad del mensaje ha sido distorsionada.*`,
            color: '#f1c40f', // Amarillo de advertencia
            icon: oldMessage.author.displayAvatarURL({ dynamic: true })
        });
    }
};
