const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a tu búnker de datos

/**
 * Despliega un reporte de auditoría en el canal configurado del dominio.
 * @param {object} guild - El servidor donde ocurre el evento.
 * @param {object} options - Configuración del log (title, description, color, thumbnail, image, icon).
 */
async function sendAuditLog(guild, options = {}) {
    try {
        console.log(`[🔍 DEBUG AUDIT] Iniciando protocolo de envío para el servidor: ${guild.name}`);
        
        // 1. Localizamos el núcleo de configuración en MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        
        if (!config) {
            console.log(`[❌ DEBUG AUDIT] Abortado: No existe registro de configuración (GuildConfig) para este servidor en MongoDB.`);
            return;
        }
        
        if (!config.LogChannelID) {
            console.log(`[❌ DEBUG AUDIT] Abortado: Configuración encontrada en la DB, pero LogChannelID está vacío. Falta usar el comando /setlogs.`);
            return;
        }

        console.log(`[🔍 DEBUG AUDIT] La base de datos solicita enviar el log al canal ID: ${config.LogChannelID}`);

        // 2. Identificamos el sector (canal) de destino
        const logChannel = guild.channels.cache.get(config.LogChannelID);
        
        if (!logChannel) {
            console.log(`[❌ DEBUG AUDIT] Falla Crítica: El canal (${config.LogChannelID}) está en la DB, pero el bot no lo encuentra en el servidor. (Revisa si el bot tiene permisos de "Ver Canal" o si fue borrado).`);
            return;
        }

        // 3. Construcción del Manifiesto de Vigilancia
        const auditEmbed = new EmbedBuilder()
            .setTitle(options.title || '⊹ Registro de Auditoría ⊹')
            .setDescription(options.description || '> *No se han proporcionado detalles de la alteración.*')
            .setColor(options.color || '#1a1a1a') // Negro Rockstar por defecto
            .setFooter({ 
                text: 'Rockstar ⊹ Vigilance Protocol', 
                iconURL: guild.client.user?.displayAvatarURL() 
            })
            .setTimestamp();

        // --- 🛠️ PERSONALIZACIÓN DINÁMICA ---
        
        if (options.icon) {
            auditEmbed.setAuthor({ 
                name: 'Vigilancia Centralizada', 
                iconURL: options.icon 
            });
        }

        if (options.thumbnail) {
            auditEmbed.setThumbnail(options.thumbnail);
        }

        if (options.image) {
            auditEmbed.setImage(options.image);
        }

        // 4. Envío del reporte al canal de logs
        await logChannel.send({ embeds: [auditEmbed] });
        console.log(`[✅ DEBUG AUDIT] Manifiesto enviado con éxito al canal: ${logChannel.name}`);

    } catch (error) {
        console.error('╰┈➤ ❌ Error crítico en el AuditLogger:', error.message);
    }
}

module.exports = { sendAuditLog };
