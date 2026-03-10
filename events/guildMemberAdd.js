const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Usamos el mismo modelo de configuración que el setup
const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', new mongoose.Schema({
    GuildID: String,
    welcome_1: Object, // { channelId: String, title: String, desc: String, ... }
    welcome_2: Object, // { channelId: String, desc: String }
    userRoleId: String,
    botRoleId: String
}));

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const { guild } = member;
        
        // 1. Buscamos la configuración en MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        if (!config) return;

        // --- 🟢 BIENVENIDA 1 (Embed Estético) ---
        if (config.welcome_1?.channelId) {
            const channelB1 = guild.channels.cache.get(config.welcome_1.channelId);
            if (channelB1) {
                const guildEmojis = guild.emojis.cache.filter(e => e.available);
                const rndEmoji = guildEmojis.size > 0 ? guildEmojis.random().toString() : '🌸';

                const embed = new EmbedBuilder()
                    .setTitle(config.welcome_1.title || `${rndEmoji} ¡Nueva Estrella!`)
                    .setDescription(config.welcome_1.desc?.replace(/{user}/g, member) || `¡Bienvenid@ ${member} a **${guild.name}**! ✨`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#FFB6C1')
                    .setFooter({ text: `Miembro #${guild.memberCount}`, iconURL: guild.iconURL() });

                channelB1.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // --- 🔵 BIENVENIDA 2 (Texto Simple / Chat General) ---
        if (config.welcome_2?.channelId) {
            const channelB2 = guild.channels.cache.get(config.welcome_2.channelId);
            if (channelB2) {
                let msgB2 = config.welcome_2.desc || `✨ ¡Bienvenida {taguser}! Pásala lindo en **{server}**. 🌸`;
                
                // Reemplazos dinámicos
                msgB2 = msgB2
                    .replace(/{taguser}/g, `<@${member.id}>`)
                    .replace(/{server}/g, guild.name)
                    .replace(/{membercount}/g, guild.memberCount.toString());

                channelB2.send(msgB2).catch(() => {});
            }
        }

        // --- 🎭 AUTOROLE ---
        try {
            if (member.user.bot && config.botRoleId) {
                await member.roles.add(config.botRoleId);
            } else if (!member.user.bot && config.userRoleId) {
                await member.roles.add(config.userRoleId);
            }
        } catch (err) {
            console.log("⚠️ No pude dar el rol de entrada (Revisa jerarquía).");
        }
    }
};