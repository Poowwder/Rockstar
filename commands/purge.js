const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'purge',
    aliases: ['clear'],
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para manipular el vacío.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('╰┈➤ ⚠️ Indica una cantidad entre 1 y 100 mensajes para consumir.');
        }

        try {
            // Borramos el propio comando del usuario para no dejar rastro
            await message.delete().catch(() => {});

            // --- 🗑️ LÓGICA DE PURGA ---
            // 'true' ignora los mensajes de más de 14 días para evitar errores de la API de Discord
            const deleted = await message.channel.bulkDelete(amount, true);
            
            const replyMsg = await message.channel.send(`╰┈➤ 🌑 **${deleted.size}** mensajes han sido devorados por las sombras.`);
            
            // Borramos el mensaje de confirmación después de 3 segundos
            setTimeout(() => replyMsg.delete().catch(() => {}), 3000);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Limpieza de Sombras (Purge) ⊹',
                description: 
                    `**Canal:** <#${message.channel.id}>\n` +
                    `**Ejecutor:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `**Cantidad:** \`${deleted.size}\` mensajes erradicados\n` +
                    `> *El historial de este sector ha sido borrado de la existencia.*`,
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando purge:", error);
            const errorMsg = await message.channel.send('╰┈➤ ❌ Las sombras se resistieron. Hubo un error al purgar.');
            setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
        }
    }
};
