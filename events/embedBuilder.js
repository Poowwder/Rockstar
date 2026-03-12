const { EmbedBuilder } = require('discord.js');

/**
 * Procesa las variables en un texto dado para la narrativa Rockstar.
 */
function parseVars(text, variables) {
    if (!text) return null;
    let t = text;
    for (const [key, value] of Object.entries(variables)) {
        t = t.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    return t;
}

/**
 * Genera el manifiesto visual de ingreso o egreso.
 */
function createWelcomeFarewellEmbed(member, config) {
    // 1. Censo de población humana
    const realMemberCount = member.guild.members.cache.filter(m => !m.user.bot).size;

    // 2. Diccionario de variables del sistema
    const variables = {
        '{username}': member.user.username,
        '{nickname}': member.displayName || member.user.username,
        '{taguser}': `<@${member.id}>`,
        '{userid}': member.id,
        '{serveruser}': member.guild.name,
        '{membercount}': realMemberCount.toString(),
        '{serverimg}': member.guild.iconURL() || ''
    };

    const embed = new EmbedBuilder();

    // 3. Título y Descripción (Narrativa Rockstar)
    const title = parseVars(config.title, variables);
    if (title) embed.setTitle(title);

    const description = parseVars(config.desc, variables);
    if (description) embed.setDescription(description);

    // 4. Color (Estética Rockstar: #1a1a1a por defecto)
    const colorCode = config.color ? config.color.replace('#', '') : '1a1a1a';
    embed.setColor(parseInt(colorCode, 16));

    // 5. Visuales de Identidad
    if (config.image) {
        const processedImage = parseVars(config.image, variables);
        if (processedImage && processedImage.startsWith('http')) {
            embed.setImage(processedImage);
        }
    }
    
    // Thumbnail fijo con el avatar del sujeto
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));

    // 6. Registro de Servidor
    const footerText = parseVars(config.footer, variables);
    if (footerText) {
        embed.setFooter({ 
            text: footerText, 
            iconURL: member.guild.iconURL() || member.client.user.displayAvatarURL()
        });
    }

    // 7. Sello de Tiempo (Timestamp)
    if (config.timestamp?.toLowerCase() === 'yes' || config.timestamp === true) {
        embed.setTimestamp();
    }

    // 8. Contenido de mención exterior
    const content = config.mensaje ? parseVars(config.mensaje, variables) : undefined;

    return { embed, content };
}

module.exports = { createWelcomeFarewellEmbed };
