const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'unban',
    description: 'Revoca el exilio de un usuario mediante su ID.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para perdonar a los exiliados.');
        }
        
        const userId = args[0];
        if (!userId) {
            return message.reply('╰┈➤ ⚠️ Identifica al alma que deseas retornar de las sombras (Provee su ID).');
        }

        try {
            // --- 🔓 PROTOCOLO DE RETORNO ---
            // Intentamos desbanear al usuario
            const bannedUser = await message.guild.members.unban(userId);
            
            // Respuesta estética en el chat
            message.reply(`╰┈➤ 🌑 **${bannedUser.tag || userId}** ha sido perdonado. Las puertas del dominio se abren para su retorno.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Exilio Revocado (Unban) ⊹',
                description: 
                    `**Sujeto Liberado:** ${bannedUser.tag || 'Desconocido'} (\`${userId}\`)\n` +
                    `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `> *Un alma ha sido liberada del abismo y su acceso ha sido restaurado.*`,
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en unban:", error);
            message.reply('╰┈➤ ❌ El abismo no retiene a ninguna entidad con ese ID o el perdón ha sido rechazado.');
        }
    }
};
