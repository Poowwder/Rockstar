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
        let contenido = message.content ? `\`\`\`\n${message.content}\n\`\`\`` : '';
        
        // Verificamos si hay un archivo adjunto
        const attachment = message.attachments.first();
        let imageURL = null;

        if (attachment) {
            // Si el archivo es una imagen, extraemos su enlace interno para mostrarla
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                imageURL = attachment.proxyURL || attachment.url;
            }
            
            // Si borraron una imagen sin texto acompañante
            if (!contenido) contenido = '`[Archivo multimedia eliminado]`';
        } else if (!contenido) {
            // Si no había ni texto ni imagen (ej. un sticker)
            contenido = '`[Mensaje vacío o ilegible]`';
        }

        // Enviamos el manifiesto al canal de Logs
        await sendAuditLog(message.guild, {
            title: '⊹ Evidencia Eliminada ⊹',
            description: 
                `**Sujeto:** ${message.author.tag}\n` +
                `**Sector:** ${message.channel}\n\n` +
                `**Original:**\n${contenido}\n\n` +
                `> *Un rastro ha sido borrado, pero el sistema no olvida.*`,
            color: '#ff4d4d',
            icon: message.author.displayAvatarURL({ dynamic: true }),
            image: imageURL // 📸 La imagen se renderizará limpia al fondo del Embed
        });
    }
};
