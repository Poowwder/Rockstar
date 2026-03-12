const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos tu logger maestro

module.exports = {
    name: 'mute',
    description: 'Silencia a un usuario mediante un rol de castigo.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para silenciar en las sombras.');
        }
        
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply('╰┈➤ ⚠️ Menciona a la entidad que deseas silenciar o proporciona su ID.');
        }

        // --- ⚖️ VERIFICACIÓN DE JERARQUÍA ---
        if (message.member.roles.highest.position <= user.roles.highest.position) {
            return message.reply('╰┈➤ ❌ Tu jerarquía no es suficiente para imponer silencio sobre este individuo.');
        }
        
        // --- 🔇 LÓGICA DEL ROL MUTED ---
        try {
            let muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
            
            if (!muteRole) {
                // Si no existe, lo creamos con estética oscura
                muteRole = await message.guild.roles.create({ 
                    name: 'Muted', 
                    color: '#000000',
                    reason: 'Creación automática para el sistema de silencio Rockstar'
                });

                // Configuramos los canales para que no puedan hablar
                message.guild.channels.cache.forEach(ch => {
                    ch.permissionOverwrites.create(muteRole, { SendMessages: false, AddReactions: false }).catch(() => {});
                });
            }

            await user.roles.add(muteRole);
            message.reply(`╰┈➤ 🌑 **${user.user.tag}** ha sido silenciado. Sus palabras ya no existen aquí.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Protocolo de Silencio ⊹',
                description: 
                    `**Usuario Silenciado:** ${user.user.tag} (\`${user.id}\`)\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `> *Las sombras le han arrebatado la voz mediante el rol de castigo.*`,
                thumbnail: user.user.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en mute:", error);
            message.reply('╰┈➤ ❌ Hubo una perturbación y no se pudo aplicar el silencio. Revisa mis permisos.');
        }
    }
};
