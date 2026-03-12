const ms = require('ms');
const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'slowmode',
    description: 'Altera el flujo temporal (cooldown) de un canal.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar el flujo temporal de este sector.');
        }

        const time = args[0];
        if (!time) {
            return message.reply('╰┈➤ ⚠️ Indica el lapso de letargo (ej: 10s, 1m, 1h) o `0` para restaurar el flujo normal.');
        }
        
        // --- ⏳ LÓGICA DE SLOWMODE ---
        // Convertimos el tiempo a segundos
        const seconds = time === '0' ? 0 : ms(time) / 1000;

        if (seconds === undefined || isNaN(seconds)) {
            return message.reply('╰┈➤ ❌ Formato de tiempo inválido. Usa segundos (s), minutos (m) u horas (h).');
        }

        if (seconds > 21600) {
            return message.reply('╰┈➤ ❌ El letargo no puede superar las 6 horas.');
        }

        try {
            await message.channel.setRateLimitPerUser(seconds);
            
            const status = seconds === 0 ? 'restaurado' : `limitado a **${time}**`;
            message.reply(`╰┈➤ 🌑 **Flujo temporal alterado.** El canal ha sido ${status}.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Control Temporal (Slowmode) ⊹',
                description: 
                    `**Canal:** <#${message.channel.id}>\n` +
                    `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `**Nuevo lapso:** \`${seconds === 0 ? 'Desactivado' : time}\`\n` +
                    `> *El ritmo de las sombras ha sido modificado en este dominio.*`,
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en slowmode:", error);
            message.reply('╰┈➤ ❌ Las sombras rechazaron tu mandato. Revisa mis jerarquías en este canal.');
        }
    }
};
