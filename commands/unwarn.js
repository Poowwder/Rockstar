const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'unwarn',
    description: 'Elimina una advertencia específica del expediente de un usuario.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar los expedientes de las sombras.');
        }

        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        const warnId = args[1];

        if (!user || !warnId) {
            return message.reply('╰┈➤ ⚠️ **Uso correcto:** `!!unwarn @usuario [ID_del_warn]`');
        }

        // --- 📂 LECTURA DE EXPEDIENTES ---
        let warns = {};
        try {
            if (fs.existsSync(warningsPath)) {
                warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
            }
        } catch (e) {
            console.error("Error leyendo warnings.json:", e);
            return message.reply('╰┈➤ ❌ Error al acceder a los archivos del sistema.');
        }

        const guildWarns = warns[message.guild.id];
        const userWarns = guildWarns ? guildWarns[user.id] : null;

        if (!userWarns || userWarns.length === 0) {
            return message.reply('╰┈➤ ❌ Este sujeto no posee antecedentes registrados en este dominio.');
        }

        // --- 🧹 PROCESO DE INDULTO ---
        const initialLength = userWarns.length;
        warns[message.guild.id][user.id] = userWarns.filter(w => w.id !== warnId);

        if (warns[message.guild.id][user.id].length === initialLength) {
            return message.reply(`╰┈➤ ❌ No se encontró ninguna advertencia con el ID \`${warnId}\` en su expediente.`);
        }

        try {
            // Guardar cambios en el archivo
            fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));
            
            message.reply(`╰┈➤ 🌑 El indulto ha sido procesado. La advertencia \`${warnId}\` de **${user.tag}** ha sido erradicada.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Indulto de Expediente (Unwarn) ⊹',
                description: 
                    `**Sujeto Indultado:** ${user.tag} (\`${user.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `**Warn ID Removido:** \`${warnId}\`\n` +
                    `> *Una mancha en su historial ha sido borrada de la existencia.*`,
                thumbnail: user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error guardando unwarn:", error);
            message.reply('╰┈➤ ❌ Fallo crítico al intentar actualizar el expediente físico.');
        }
    }
};
