const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'nuke',
    description: 'Erradica un canal y lo recrea desde las cenizas.',
    async execute(message) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para erradicar este dominio.');
        }

        try {
            // --- ☢️ LÓGICA DE PURGA (NUKE) ---
            const pos = message.channel.position;
            const channelName = message.channel.name;
            
            // Clonamos el canal con todos sus permisos y ajustes
            const newChan = await message.channel.clone();
            
            // Eliminamos el original
            await message.channel.delete();
            
            // Restauramos la posición
            await newChan.setPosition(pos);
            
            // Mensaje de confirmación en el nuevo canal
            const nukeEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ name: '⊹ Dominio Purgado ⊹' })
                .setDescription(`╰┈➤ 🌑 Este canal ha sido erradicado y ha renacido de las sombras.\n> *Iniciado por: ${message.author.tag}*`)
                .setImage('https://i.pinimg.com/originals/a0/78/fb/a078fb2fc89d48b1aa61fae0a24b17b6.gif');

            await newChan.send({ embeds: [nukeEmbed] });

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Protocolo de Erradicación (Nuke) ⊹',
                description: 
                    `**Canal Reconstruido:** <#${newChan.id}> (\`${channelName}\`)\n` +
                    `**Ejecutor:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                    `> *Un dominio entero ha sido consumido por el vacío y clonado exitosamente.*`,
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en el comando nuke:", error);
            // Si el bot no puede borrar el canal, avisamos (aunque usualmente es por falta de permisos)
            message.reply('╰┈➤ ❌ Las sombras se resisten. No se pudo completar la erradicación.').catch(() => {});
        }
    }
};
