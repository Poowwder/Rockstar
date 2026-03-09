const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const data = await getUserData(member.guild.id);
        const config = data.welcomeConfig?.despedida;
        if (!config || !config.channelId) return;

        const chan = member.guild.channels.cache.get(config.channelId);
        if (!chan) return;

        const realMemberCount = member.guild.members.cache.filter(m => !m.user.bot).size;

        const replaceVars = (text) => {
            if (!text) return null;
            return text
                .replace(/{username}/g, member.user.username)
                .replace(/{taguser}/g, member.user.tag)
                .replace(/{serveruser}/g, member.guild.name)
                .replace(/{membercount}/g, realMemberCount.toString())
                .replace(/{serverimg}/g, member.guild.iconURL() || '');
        };

        const embed = new EmbedBuilder().setColor(config.color || '#FF6961');

        // Lógica de Timestamp (Yes/No)
        if (config.timestamp?.toLowerCase() === 'yes') embed.setTimestamp();

        if (config.title) embed.setTitle(replaceVars(config.title));
        if (config.desc) embed.setDescription(replaceVars(config.desc));
        if (config.image) embed.setImage(config.image);
        if (config.footer) embed.setFooter({ text: replaceVars(config.footer), iconURL: member.guild.iconURL() });

        await chan.send({ embeds: [embed] });
    }
};