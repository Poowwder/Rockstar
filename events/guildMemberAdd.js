const { GuildConfig } = require('../data/mongodb.js'); 
const { createWelcomeFarewellEmbed } = require('./embedBuilder.js'); // Nuestra forja de embeds

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
            console.log(`⚠️ Error Auto-Role en ${guild.name}: Revisa mi jerarquía de roles.`);
        }

        // --- 🟢 BIENVENIDA 1: EMBED ROCKSTAR (Anuncios/Entradas) ---
        if (config.Welcome1Config?.channelId) {
            const channelB1 = guild.channels.cache.get(config.Welcome1Config.channelId);
            if (channelB1) {
                // Generamos el embed usando nuestro procesador central
                const { embed } = createWelcomeFarewellEmbed(member, config.Welcome1Config);
                
                // Si el config no tiene título/desc, el procesador pone los de Rockstar por defecto
                channelB1.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // --- 🔵 BIENVENIDA 2: SALUDO RÁPIDO (Chat General) ---
        if (config.Welcome2Config?.channelId) {
            const channelB2 = guild.channels.cache.get(config.Welcome2Config.channelId);
            if (channelB2) {
                // Aquí usamos la propiedad 'content' (mensaje fuera del embed)
                const { content } = createWelcomeFarewellEmbed(member, config.Welcome2Config);
                
                if (content) {
                    channelB2.send(content).catch(() => {});
                }
            }
        }
    }
};
