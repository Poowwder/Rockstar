const { PermissionFlagsBits } = require('discord.js');
const { Warning } = require('../data/mongodb.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'unwarn',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar los expedientes.');
        }

        const warnId = args[0]?.toUpperCase();
        if (!warnId) return message.reply('╰┈➤ ⚠️ Indica el ID de la advertencia que deseas erradicar.');

        // --- 🧹 PURGA EN DATABASE ---
        const deletedWarn = await Warning.findOneAndDelete({ GuildID: message.guild.id, WarnID: warnId });

        if (!deletedWarn) {
            return message.reply(`╰┈➤ ❌ No se encontró ningún registro con el ID \`${warnId}\`.`);
        }

        message.reply(`╰┈➤ 🌑 El registro \`${warnId}\` ha sido borrado de la existencia.`);

        // --- 👁️ AUDITORÍA AUTOMÁTICA ---
        await sendAuditLog(message.guild, {
            title: '⊹ Indulto de Expediente ⊹',
            description: 
                `**ID Removido:** \`${warnId}\`\n` +
                `**Moderador:** ${message.author.tag}\n` +
                `**Sujeto Afectado:** <@${deletedWarn.UserID}>\n` +
                `> *Una mancha en el historial ha sido purgada.*`,
            color: '#1a1a1a',
            icon: message.author.displayAvatarURL()
        });
    }
};
