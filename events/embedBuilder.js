const { EmbedBuilder } = require('discord.js');

/**
 * Procesa las variables en un texto dado.
 * @param {string} text - El texto con variables como {username}.
 * @param {object} variables - El diccionario de valores.
 * @returns {string|null} - El texto procesado o null.
 */
function parseVars(text, variables) {
    if (!text) return null;
    let t = text;
    for (const [key, value] of Object.entries(variables)) {
        // Usamos un regex global para cambiar todas las ocurrencias
        t = t.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    return t;
}

/**
 * Crea un embed de Bienvenida o Despedida basado en la configuración de la DB.
 */
function createWelcomeFarewellEmbed(member, config) {
    // 1. Contamos solo humanos para {membercount}
    const realMemberCount = member.guild.members.cache.filter(m => !m.user.bot).size;

    // 2. Diccionario de variables (Unificado con tus peticiones anteriores)
    const variables = {
        '{username}': member.user.username,
        '{nickname}': member.displayName || member.user.username,
        '{taguser}': `<@${member.id}>`,
        '{serveruser}': member.guild.name,
        '{membercount}': realMemberCount.toString(),
        '{serverimg}': member.guild.iconURL() || ''
    };

    const embed = new EmbedBuilder();

    // 3. Título y Descripción
    const title = parseVars(config.title, variables);
    if (title) embed.setTitle(title);

    const description = parseVars(config.desc, variables);
    if (description) embed.setDescription(description);

    // 4. Color (Aesthetic Rockstar)
    const color = config.color ? parseInt(config.color.replace('#', ''), 16) : 0xFFB6C1;
    embed.setColor(color);

    // 5. Imagen y Thumbnail (Avatar automático)
    if (config.image) embed.setImage(parseVars(config.image, variables));
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));

    // 6. Footer con Icono de Servidor variable
    const footerText = parseVars(config.footer, variables);
    if (footerText) {
        embed.setFooter({ 
            text: footerText, 
            iconURL: member.guild.iconURL() 
        });
    }

    // 7. Lógica de Timestamp (basada en el Modal "yes/no")
    if (config.timestamp?.toLowerCase() === 'yes') {
        embed.setTimestamp();
    }

    // 8. Mensaje exterior (Fuera del embed)
    const content = config.mensaje ? parseVars(config.mensaje, variables) : undefined;

    return { embed, content };
}

module.exports = { createWelcomeFarewellEmbed };