const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js');

/**
 * Despliega un reporte de auditoría en el canal configurado del dominio.
 * @param {object} guild - El servidor donde ocurre el evento.
 * @param {object} options - Configuración del log (title, description, color, thumbnail, image, icon).
 */
async function sendAuditLog(guild, options = {}) {
    try {
        // 1. Localizamos el núcleo de configuración en MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        
        // Si no hay configuración o no se ha establecido un canal de logs, el ojo permanece cerrado.
        if (!config || !config.LogChannelID) return;

        // 2. Identificamos el sector (canal) de destino
        const logChannel = guild.channels.cache.get(config.LogChannelID);
        if (!logChannel) return;

        // 3. Construcción del Manifiesto de Vigilancia
        const auditEmbed = new EmbedBuilder()
            .setTitle(options.title || '⊹ Registro de Auditoría ⊹')
            .setDescription(options.description || '> *No se han proporcionado detalles de la alteración.*')
            .setColor(options.color || '#1a1a1a') // Negro Rockstar por defecto
            .setFooter({ 
                text: 'Rockstar ⊹ Vigilance Protocol', 
                iconURL: guild.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        // --- 🛠️ PERSONALIZACIÓN DINÁMICA ---
        
        // Si se provee un icono para el autor (generalmente el moderador o el sistema)
        if (options.icon) {
            auditEmbed.setAuthor({ 
                name: 'Vigilancia Centralizada', 
                iconURL: options.icon 
            });
        }

        // Miniatura (Avatar del usuario afectado o similar)
        if (options.thumbnail) {
            auditEmbed.setThumbnail(options.thumbnail);
        }

        // Imagen grande (Para nukes, cambios de avatar, etc.)
        if (options.image) {
            auditEmbed.setImage(options.image);
        }

        // 4. Envío del reporte al canal de logs
        await logChannel.send({ embeds: [auditEmbed] });

    } catch (error) {
        console.error('╰┈➤ ❌ Error crítico en el AuditLogger:', error.message);
    }
}

module.exports = { sendAuditLog };
