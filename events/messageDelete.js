const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // Ignoramos a los entes mecánicos (Bots)
        if (message.author?.bot) return;

        // 1. CASO A: Mensaje Antiguo (Fuera del radar)
        if (message.partial) {
            return await sendAuditLog(message.guild, {
                title: '⊹ Evidencia Antigua Eliminada ⊹',
                description: 
                    `**Sector:** ${message.channel}\n\n` +
                    `> *Las sombras devoraron un mensaje antiguo. Al estar fuera de mi registro temporal, su contenido es irrecuperable.*`,
                color: '#ff4d4d' // Rojo Rockstar
            });
        }

        // 2. CASO B: Mensaje Reciente (En el radar)
        
        // Verificamos si el mensaje tenía algún archivo o imagen adjunta
        const attachment = message.attachments.first();
        
        // Formateamos el texto en un bloque de código elegante
        let contenido = message.content ? `\`\`\`\n${message.content}\n\`\`\`` : '';
        
        // Si borraron una imagen, añadimos el enlace para que el staff pueda verla
        if (attachment) {
            contenido += `\n📎 **Archivo destruido:** [Enlace a la evidencia](${attachment.proxyURL || attachment.url})`;
        }

        // Si no había ni texto ni imagen (ej. un sticker o embed raro)
        if (!contenido) {
            contenido = '`[El mensaje original era ilegible o multimedia no compatible]`';
        }

        await sendAuditLog(message.guild, {
            title: '⊹ Evidencia Eliminada ⊹',
            description: 
                `**Sujeto:** ${message.author.tag}\n` +
                `**Sector:** ${message.channel}\n\n` +
                `**Lo que se borró:**\n${contenido}\n\n` +
                `> *Un rastro ha sido borrado, pero el sistema no olvida.*`,
            color: '#ff4d4d',
            icon: message.author.displayAvatarURL({ dynamic: true })
        });
    }
};
