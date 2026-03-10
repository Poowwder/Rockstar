const { EmbedBuilder } = require('discord.js');
// Importamos la configuración desde tu central de datos
const { GuildConfig } = require('../data/mongodb.js'); 

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const { guild } = member;
        
        // 1. Buscamos la configuración en MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        if (!config) return;

        // --- 🎭 SISTEMA DE AUTO-ROLE (Se ejecuta primero para evitar demoras) ---
        try {
            if (member.user.bot && config.botRoleId) {
                const role = guild.roles.cache.get(config.botRoleId);
                if (role) await member.roles.add(role);
            } else if (!member.user.bot && config.userRoleId) {
                const role = guild.roles.cache.get(config.userRoleId);
                if (role) await member.roles.add(role);
            }
        } catch (err) {
            console.log(`⚠️ Error Auto-Role en ${guild.name}: Verifica mi jerarquía de roles.`);
        }

        // --- 🟢 BIENVENIDA 1 (Embed Estético Principal) ---
        if (config.Welcome1Config?.channelId) {
            const channelB1 = guild.channels.cache.get(config.Welcome1Config.channelId);
            if (channelB1) {
                const guildEmojis = guild.emojis.cache.filter(e => e.available);
                const rndEmoji = guildEmojis.size > 0 ? guildEmojis.random().toString() : '🌸';

                const embed = new EmbedBuilder()
                    .setTitle(config.Welcome1Config.title?.replace(/{username}/g, member.user.username) || `${rndEmoji} ¡Nueva Estrella!`)
                    .setDescription(
                        (config.Welcome1Config.desc || `¡Bienvenid@ {user} a **{server}**! ✨`)
                        .replace(/{user}/g, member.toString())
                        .replace(/{server}/g, guild.name)
                        .replace(/{membercount}/g, guild.memberCount.toString())
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#FFB6C1')
                    .setFooter({ text: `Miembro #${guild.memberCount}`, iconURL: guild.iconURL() })
                    .setTimestamp();

                if (config.Welcome1Config.image) embed.setImage(config.Welcome1Config.image);

                channelB1.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // --- 🔵 BIENVENIDA 2 (Saludo Corto / Chat General) ---
        if (config.Welcome2Config?.channelId) {
            const channelB2 = guild.channels.cache.get(config.Welcome2Config.channelId);
            if (channelB2) {
                let msgB2 = config.Welcome2Config.desc || `✨ ¡Bienvenida {taguser}! Pásala lindo en **{server}**. 🌸`;
                
                msgB2 = msgB2
                    .replace(/{taguser}/g, member.toString())
                    .replace(/{user}/g, member.toString())
                    .replace(/{server}/g, guild.name)
                    .replace(/{membercount}/g, guild.memberCount.toString());

                channelB2.send(msgB2).catch(() => {});
            }
        }
    }
};