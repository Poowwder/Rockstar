const { EmbedBuilder } = require('discord.js');

function parseVars(text, variables) {
    if (!text) return null;
    let t = text;
    for (const [key, value] of Object.entries(variables)) {
        t = t.replace(new RegExp(key, 'g'), value);
    }
    return t;
}

function createWelcomeFarewellEmbed(member, config) {
    const variables = {
        '{user}': `<@${member.id}>`,
        '{username}': member.user.username,
        '{tag}': member.user.tag,
        '{nick}': member.nickname || member.user.username,
        '{server}': member.guild.name,
        '{count}': member.guild.memberCount
    };

    const embed = new EmbedBuilder();

    const title = parseVars(config.titulo, variables);
    if (title) embed.setTitle(title);

    const description = parseVars(config.descripcion, variables);
    if (description) embed.setDescription(description);

    embed.setAuthor({ name: parseVars('{nick}', variables), iconURL: member.user.displayAvatarURL() });

    const color = config.color ? parseInt(config.color.replace('#', ''), 16) : Math.floor(Math.random() * 0xFFFFFF);
    embed.setColor(color);

    if (config.thumbnail === 'avatar') {
        embed.setThumbnail(member.user.displayAvatarURL());
    } else if (config.thumbnail) {
        embed.setThumbnail(parseVars(config.thumbnail, variables));
    }

    if (config.imagen) {
        embed.setImage(parseVars(config.imagen, variables));
    }

    const footerText = parseVars(config.footer, variables);
    if (footerText) {
        let footerIcon = null;
        if (config.footerimg === 'server' && member.guild.iconURL()) {
            footerIcon = member.guild.iconURL();
        } else if (config.footerimg && config.footerimg !== 'server') {
            footerIcon = parseVars(config.footerimg, variables);
        }
        embed.setFooter({ text: footerText, iconURL: footerIcon });
    }

    if (config.timestamp) {
        embed.setTimestamp();
    }

    const content = config.mensaje ? parseVars(config.mensaje, variables) : undefined;

    return { embed, content };
}

module.exports = { createWelcomeFarewellEmbed };