const ms = require('ms');
const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'timeout',
    description: 'Aísla a un usuario en las sombras por un tiempo determinado.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para exiliar a nadie a las sombras.');
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const time = args[1];

        if (!member || !time) {
            return message.reply('╰┈➤ ⚠️ **Uso correcto:** `!!timeout @usuario 10m` (m: minutos, h: horas, d: días).');
        }

        // --- ⚖️ VERIFICACIÓN DE JERARQUÍA ---
        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.reply('╰┈➤ ❌ Tu poder es insuficiente para someter a esta entidad.');
        }

        const duration = ms(time);
        if (!duration || duration > 2419200000) { // Límite de 28 días de Discord
            return message.reply('╰┈➤ ❌ Formato de tiempo inválido o excede el límite de 28 días.');
        }

        try {
            // --- ⏳ APLICACIÓN DEL AISLAMIENTO ---
            await member.timeout(duration, `Aislamiento dictado por ${message.author.tag}`);
            
            message.reply(`╰┈➤ 🌑 **${member.user.tag}** ha sido aislado. Su presencia se desvanece por **${time}**.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Aislamiento Temporal (Timeout) ⊹',
                description: 
                    `**Sujeto:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `**Duración:** \`${time}\`\n` +
                    `> *La voz del individuo ha sido silenciada en el vacío temporal.*`,
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en timeout:", error);
            message.reply('╰┈➤ ❌ Las sombras se resistieron. Verifica que mi rol esté por encima del objetivo.');
        }
    }
};
