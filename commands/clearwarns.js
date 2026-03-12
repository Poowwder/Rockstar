const { PermissionFlagsBits } = require('discord.js');
const { Warning } = require('../data/mongodb.js'); // El núcleo de datos
const { sendAuditLog } = require('../functions/auditLogger.js'); // El ojo del sistema

module.exports = {
    name: 'clearwarns',
    description: 'Erradica el historial completo de advertencias de un sujeto.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para purgar expedientes en las sombras.');
        }
        
        const target = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        if (!target) {
            return message.reply('╰┈➤ ⚠️ Identifica al sujeto cuyo expediente deseas purgar por completo.');
        }

        try {
            // --- 🧪 VERIFICACIÓN DE EXISTENCIA ---
            const count = await Warning.countDocuments({ GuildID: message.guild.id, UserID: target.id });

            if (count === 0) {
                return message.reply('╰┈➤ ❌ Este individuo no posee antecedentes registrados en el sistema.');
            }

            // --- ☢️ PURGA TOTAL EN MONGODB ---
            await Warning.deleteMany({ GuildID: message.guild.id, UserID: target.id });

            message.reply(`╰┈➤ 🌑 **Protocolo de Amnistía:** El historial de **${target.tag}** ha sido incinerado. Sus registros vuelven a cero.`);

            // --- 👁️ SISTEMA DE LOGS (AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Purga Total de Expediente ⊹',
                description: 
                    `**Sujeto:** ${target.tag} (\`${target.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `**Registros Eliminados:** \`${count}\`\n` +
                    `> *Toda mancha en el historial del sujeto ha sido erradicada de la base de datos.*`,
                thumbnail: target.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en clearwarns:", error);
            message.reply('╰┈➤ ❌ Fallo crítico al intentar purgar los archivos del cluster.');
        }
    }
};
