const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'untimeout',
    description: 'Revoca el aislamiento temporal de un usuario.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para revocar el exilio temporal.');
        }
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Menciona a la entidad que deseas liberar del exilio temporal o provee su ID.');
        }

        // --- ⏳ COMPROBACIÓN DE ESTADO ---
        if (!member.communicationDisabledUntilTimestamp) {
            return message.reply('╰┈➤ ❌ Este sujeto no se encuentra actualmente en aislamiento temporal.');
        }

        try {
            // --- 🔓 LÓGICA DE LIBERACIÓN ---
            // Enviar 'null' como duración elimina el timeout inmediatamente
            await member.timeout(null, `Aislamiento revocado por ${message.author.tag}`);
            
            message.reply(`╰┈➤ 🌑 El aislamiento de **${member.user.tag}** ha sido revocado. Es libre de vagar de nuevo por el dominio.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Aislamiento Revocado (Untimeout) ⊹',
                description: 
                    `**Sujeto Liberado:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `> *El exilio temporal ha concluido por decreto de la autoridad.*`,
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en untimeout:", error);
            message.reply('╰┈➤ ❌ Hubo un error al intentar revocar el aislamiento. Revisa mi jerarquía de roles.');
        }
    }
};
