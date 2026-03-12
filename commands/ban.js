const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'ban',
    description: 'Banea a un usuario del servidor y registra el exilio.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para dictar sentencias de exilio.');
        }

        // --- 🎯 IDENTIFICACIÓN DEL OBJETIVO ---
        const user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        if (!user) {
            return message.reply('╰┈➤ ⚠️ Identifica al alma que será desterrada (Mención o ID).');
        }

        const reason = args.slice(1).join(' ') || 'Sin razón especificada';
        const member = message.guild.members.cache.get(user.id);

        // --- ⚖️ VERIFICACIÓN DE JERARQUÍA ---
        if (member && message.member.roles.highest.position <= member.roles.highest.position) {
            return message.reply('╰┈➤ ❌ Tu poder no es suficiente para someter a este usuario.');
        }
        
        if (member && !member.bannable) {
            return message.reply('╰┈➤ ❌ Las sombras protegen a este individuo; no puedo banearlo.');
        }

        try {
            // --- 💀 EJECUCIÓN DEL BANEO ---
            await message.guild.members.ban(user, { reason: `Dictado por ${message.author.tag}: ${reason}` });
            
            // Respuesta inmediata en el chat
            message.reply(`╰┈➤ 🌑 **${user.tag}** ha sido consumido por el vacío. Exilio permanente dictado.`);

            // --- 👁️ LOG AUTOMÁTICO (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Sentencia de Exilio (Ban) ⊹',
                description: 
                    `**Usuario Desterrado:** ${user.tag} (\`${user.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `**Motivo:** \`${reason}\`\n` +
                    `> *El individuo ha sido erradicado del dominio.*`,
                thumbnail: user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando ban:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación en las sombras y no se pudo completar el baneo.');
        }
    }
};
