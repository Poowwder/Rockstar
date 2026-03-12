const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'lock',
    description: 'Sella el canal actual para evitar que las almas envíen mensajes.',
    async execute(message) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para sellar este dominio.');
        }

        try {
            // --- 🔒 LÓGICA DE BLOQUEO ---
            // Editamos los permisos de @everyone para que no puedan enviar mensajes
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { 
                SendMessages: false 
            });

            // Respuesta estética en el chat
            message.reply('╰┈➤ 🌑 **Canal Sellado.** Las voces han sido silenciadas en este sector.');

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Canal Bloqueado (Lock) ⊹',
                description: 
                    `**Canal:** <#${message.channel.id}>\n` +
                    `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `> *El acceso de escritura ha sido revocado para el público.*`,
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando lock:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación en las sombras y no se pudo sellar el canal.');
        }
    }
};
