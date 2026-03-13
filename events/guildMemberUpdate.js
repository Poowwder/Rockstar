const { EmbedBuilder } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const guild = newMember.guild;

        // --- 💎 DETECTOR DE INYECCIÓN DE PODER (BOOST) ---
        // Verificamos si antes NO era booster y ahora SÍ lo es.
        if (!oldMember.premiumSince && newMember.premiumSince) {
            
            // 1. Buscamos el canal donde enviar el anuncio. 
            // Usa el canal del sistema por defecto, o busca uno llamado "chat-general"
            const canalAnuncio = guild.systemChannel || guild.channels.cache.find(c => c.name.includes('general') || c.name.includes('chat'));

            if (canalAnuncio) {
                const boostEmbed = new EmbedBuilder()
                    .setTitle('⊹ EL DOMINIO SE FORTALECE ⊹')
                    .setColor('#1a1a1a') // Negro Rockstar
                    .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                    .setImage('https://i.pinimg.com/originals/c6/3e/4d/c63e4dd19fccf4bcbd82ec1e78eb3cc5.gif') // GIF elegante de Nightfall/Nitro
                    .setDescription(
                        `> *“Un nuevo mecenas ha inyectado poder puro en el núcleo del abismo...”*\n\n` +
                        `╰┈➤ 💎 **${newMember.user.username}** ha mejorado las instalaciones del servidor.\n` +
                        `╰┈➤ 📈 **Nivel del dominio:** \`${guild.premiumTier}\`\n` +
                        `╰┈➤ 🔮 **Mejoras totales:** \`${guild.premiumSubscriptionCount}\`\n\n` +
                        `-# Las sombras te otorgan su gratitud eterna y privilegios exclusivos.`
                    )
                    .setFooter({ text: 'Rockstar Nova ⊹ Patronato', iconURL: guild.iconURL() });

                // Mencionamos al usuario fuera del embed para que le llegue la notificación
                await canalAnuncio.send({ content: `╰┈➤ <@${newMember.id}>`, embeds: [boostEmbed] });
            }

            // 2. Registro silencioso en los Logs de Auditoría
            await sendAuditLog(guild, {
                title: '⊹ Inyección de Poder (Boost) ⊹',
                description: 
                    `**Sujeto:** ${newMember.user.tag}\n\n` +
                    `> *El individuo ha utilizado sus recursos de Discord Nitro para expandir la infraestructura de este servidor.*`,
                color: '#ff73fa', // Color Rosa Nitro para que resalte en los logs
                icon: newMember.user.displayAvatarURL()
            });
        }
    }
};
