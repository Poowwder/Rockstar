const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'unlock',
    description: 'Restaura el flujo de mensajes en el canal actual.',
    async execute(message) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para abrir las puertas de este dominio.');
        }

        try {
            // --- 🔓 LÓGICA DE DESBLOQUEO ---
            // Usamos 'null' para que el permiso vuelva a su estado original (heredado)
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { 
                SendMessages: null 
            });

            // Respuesta estética Rockstar
            message.reply('╰┈➤ 🌑 **Sello Roto.** Las voces han sido restauradas en este sector.');

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Canal Desbloqueado (Unlock) ⊹',
                description: 
                    `**Canal:** <#${message.channel.id}>\n` +
                    `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `> *El bloqueo de escritura ha sido levantado por la autoridad.*`,
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando unlock:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación en las sombras y no se pudo romper el sello del canal.');
        }
    }
};
