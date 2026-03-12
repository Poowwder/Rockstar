const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        // Intentamos recuperar mensajes antiguos si no están en memoria
        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch (error) {
                // Si ya no existe, abortamos la misión
                return;
            }
        }
        
        // Ignoramos a los entes mecánicos (bots)
        if (oldMessage.author?.bot) return;
        
        // Discord dispara este evento cuando se cargan enlaces/imágenes (embeds automáticos).
        // Bloqueamos eso verificando si el texto realmente cambió.
        if (oldMessage.content === newMessage.content) return;

        await sendAuditLog(oldMessage.guild, {
            title: '⊹ Alteración de Mensaje ⊹',
            description: 
                `**Autor:** ${oldMessage.author.tag} (\`${oldMessage.author.id}\`)\n` +
                `**Sector:** ${oldMessage.channel}\n\n` +
                `**Antes:**\n\`\`\`${oldMessage.content || '[Vacío/Multimedia]'}\`\`\`\n` +
                `**Después:**\n\`\`\`${newMessage.content || '[Vacío/Multimedia]'}\`\`\`\n` +
                `> *La realidad del mensaje ha sido distorsionada.*`,
            color: '#f1c40f', // Amarillo de advertencia
            icon: oldMessage.author.displayAvatarURL({ dynamic: true })
        });
    }
};
