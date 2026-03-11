const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); 

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const { guild } = member;
        
        // 1. Buscamos la configuración en la central MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        if (!config) return;

        // --- 🎭 SISTEMA DE AUTO-ROLE (Prioridad Inmediata) ---
        try {
            const roleId = member.user.bot ? config.botRoleId : config.userRoleId;
            if (roleId) {
                const role = guild.roles.cache.get(roleId);
                if (role) await member.roles.add(role);
            }
        } catch (err) {
            console.log(`⚠️ Error Auto-Role en ${guild.name}: Revisa mi jerarquía.`);
        }

        // --- 🟢 BIENVENIDA 1: EMBED ROCKSTAR (Anuncios/Entradas) ---
        if (config.Welcome1Config?.channelId) {
            const channelB1 = guild.channels.cache.get(config.Welcome1Config.channelId);
            if (channelB1) {
                const guildEmojis = guild.emojis.cache.filter(e => e.available);
                const rndEmoji = guildEmojis.size > 0 ? guildEmojis.random().toString() : '🌑';

                const embed = new EmbedBuilder()
                    .setTitle(config.Welcome1Config.title?.replace(/{username}/g, member.user.username) || `${rndEmoji} PROTOCOLO DE INGRESO`)
                    .setDescription(
                        (config.Welcome1Config.desc || `> *“Las sombras de **{server}** te dan la bienvenida, {user}.”*\n\nEres nuestro activo número **#{membercount}**.`)
                        .replace(/{user}/g, member.toString())
                        .replace(/{server}/g, guild.name)
                        .replace(/{membercount}/g, guild.memberCount.toString())
                    )
                    .setThumbnail(member.user.displayAvatarURL({ forceStatic: false }))
                    .setColor('#1a1a1a') // Estética Nightfall
                    .setImage(config.Welcome1Config.image || 'https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
                    .setFooter({ text: `Nightfall System ⊹ Member ID: ${member.id}`, iconURL: guild.iconURL() })
                    .setTimestamp();

                channelB1.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // --- 🔵 BIENVENIDA 2: SALUDO RÁPIDO (Chat General) ---
        if (config.Welcome2Config?.channelId) {
            const channelB2 = guild.channels.cache.get(config.Welcome2Config.channelId);
            if (channelB2) {
                let msgB2 = config.Welcome2Config.desc || `╰┈➤ 🥃 **{user}** ha entrado al club. Bienvenid@ a **{server}**.`;
                
                msgB2 = msgB2
                    .replace(/{user}/g, member.toString())
                    .replace(/{taguser}/g, member.toString())
                    .replace(/{server}/g, guild.name)
                    .replace(/{membercount}/g, guild.memberCount.toString());

                channelB2.send(msgB2).catch(() => {});
            }
        }
    }
};
