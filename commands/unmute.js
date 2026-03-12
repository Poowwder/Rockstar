const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'unmute',
    description: 'Devuelve la voz a un usuario retirando el rol de castigo.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para restaurar voces en las sombras.');
        }
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Menciona a la entidad a la que deseas devolverle la voz o provee su ID.');
        }

        // --- 🔇 COMPROBACIÓN DEL ROL ---
        const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return message.reply('╰┈➤ ❌ Este sujeto no se encuentra bajo el yugo del silencio.');
        }

        try {
            // --- 🔊 LÓGICA DE LIBERACIÓN ---
            await member.roles.remove(muteRole);
            
            message.reply(`╰┈➤ 🌑 **${member.user.tag}** ha recuperado su voz. El silencio se desvanece en este dominio.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Restauración de Voz (Unmute) ⊹',
                description: 
                    `**Sujeto Restaurado:** ${member.user.tag} (\`${member.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `> *La mordaza ha sido retirada. Su rastro vuelve a ser audible en el sistema.*`,
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a', // Negro Rockstar
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en unmute:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación y no se pudo retirar el silencio. Revisa mi jerarquía.');
        }
    }
};
