const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor y registra el suceso.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('╰┈➤ ❌ No tienes autoridad para expulsar a nadie de estas sombras.');
        }

        // --- 🎯 IDENTIFICACIÓN DEL OBJETIVO ---
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Identifica al individuo que será expulsado (Mención o ID).');
        }

        // --- ⚖️ VERIFICACIÓN DE JERARQUÍA Y PODER ---
        if (!member.kickable) {
            return message.reply('╰┈➤ ❌ Las sombras protegen a este usuario; mi poder no puede alcanzarlo.');
        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.reply('╰┈➤ ❌ Tu jerarquía es insuficiente para dictar esta expulsión.');
        }

        const reason = args.slice(1).join(' ') || 'Sin razón especificada';

        try {
            // --- 👢 EJECUCIÓN DE LA EXPULSIÓN ---
            await member.kick(`Dictado por ${message.author.tag}: ${reason}`);
            
            // Respuesta inmediata en el chat
            message.reply(`╰┈➤ 🌑 **${member.user.tag}** ha sido expulsado del dominio. Que el vacío lo guíe.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Expulsión del Sistema (Kick) ⊹',
                description: 
                    `**Usuario Expulsado:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `**Motivo:** \`${reason}\`\n` +
                    `> *El individuo ha sido removido forzosamente del servidor.*`,
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando kick:", error);
            message.reply('╰┈➤ ❌ Hubo un error al intentar ejecutar la expulsión.');
        }
    }
};
