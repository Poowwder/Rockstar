const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { createWelcomeFarewellEmbed } = require('./embedBuilder.js');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member, client) {
        const configPath = path.join(__dirname, '..', 'goodbyeConfig.json');
        if (!fs.existsSync(configPath)) return;
        const allConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const config = allConfigs[member.guild.id];
        if (!config || !config.channelId) return;

        const channel = member.guild.channels.cache.get(config.channelId);
        if (!channel) return;

        const { embed, content } = createWelcomeFarewellEmbed(member, config);
        await channel.send({ content: content || undefined, embeds: [embed] });

        // Logs
        if (config.logsId) {
            const logsChannel = member.guild.channels.cache.get(config.logsId);
            if (logsChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Miembro salió')
                    .setColor(Math.floor(Math.random() * 0xFFFFFF))
                    .setDescription(`Salió: <@${member.id}> (${member.user.tag})\nID: ${member.id}`)
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
                    .setTimestamp();
                await logsChannel.send({ embeds: [logEmbed] });
            }
        }
    }
};