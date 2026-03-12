const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        console.log(`[🔍 DEBUG UPDATE] Evento disparado en el canal: ${oldMessage.channel?.name || 'Desconocido'}`);

        if (oldMessage.partial) {
            console.log(`[🔍 DEBUG UPDATE] Mensaje antiguo es parcial. Intentando recuperación (fetch)...`);
            try {
                await oldMessage.fetch();
                console.log(`[🔍 DEBUG UPDATE] Mensaje antiguo recuperado exitosamente.`);
            } catch (error) {
                console.log(`[❌ DEBUG UPDATE] Abortado: El mensaje no pudo ser recuperado (${error.message}).`);
                return;
            }
        }
        
        if (oldMessage.author?.bot) return;
        
        if (oldMessage.content === newMessage.content) {
            console.log(`[🔍 DEBUG UPDATE] Ignorado: El texto es idéntico (probablemente Discord cargó un embed o imagen).`);
            return;
        }

        console.log(`[🔍 DEBUG UPDATE] Edición real detectada. Autor: ${oldMessage.author?.tag}. Preparando log...`);
        await sendAuditLog(oldMessage.guild, {
            title: '⊹ Alteración de Mensaje ⊹',
            description: 
                `**Autor:** ${oldMessage.author.tag} (\`${oldMessage.author.id}\`)\n` +
                `**Sector:** ${oldMessage.channel}\n\n` +
                `**Antes:**\n\`\`\`${oldMessage.content || '[Vacío/Multimedia]'}\`\`\`\n` +
                `**Después:**\n\`\`\`${newMessage.content || '[Vacío/Multimedia]'}\`\`\`\n` +
                `> *La realidad del mensaje ha sido distorsionada.*`,
            color: '#f1c40f',
            icon: oldMessage.author.displayAvatarURL({ dynamic: true })
        });
    }
};
