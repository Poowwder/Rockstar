const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'nick',
    description: 'Altera la identidad nominal de un usuario en el dominio.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar identidades en las sombras.');
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Identifica al individuo cuyo velo nominal deseas modificar.');
        }

        // --- ⚖️ VERIFICACIÓN DE PODER ---
        if (!member.manageable) {
            return message.reply('╰┈➤ ❌ Mi poder no es suficiente para alterar a este sujeto. Revisa mi jerarquía.');
        }

        const oldNick = member.displayName;
        const newNick = args.slice(1).join(' ') || null; // Si está vacío, se restablece

        try {
            // --- 🎭 ALTERACIÓN DE IDENTIDAD ---
            await member.setNickname(newNick);

            const response = newNick 
                ? `╰┈➤ 🌑 La identidad de **${member.user.tag}** ha sido alterada a: **${newNick}**.` 
                : `╰┈➤ 🌑 El velo nominal de **${member.user.tag}** ha sido restablecido.`;

            message.reply(response);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Alteración de Identidad (Nick) ⊹',
                description: 
                    `**Sujeto:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Nombre Anterior:** \`${oldNick}\`\n` +
                    `**Nuevo Nombre:** \`${newNick || 'Restablecido'}\`\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `> *Un cambio en el registro nominal ha sido detectado y archivado.*`,
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en nick:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación al intentar modificar la identidad del usuario.');
        }
    }
};
