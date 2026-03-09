const { createWelcomeFarewellEmbed } = require('../embedBuilder.js');
const { getGuildData } = require('../userManager.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const guildId = member.guild.id;
        
        // 1. Obtener la configuración del servidor desde la DB
        const data = await getGuildData(guildId);
        const config = data.welcomeConfig;
        if (!config) return;

        // --- 🟢 BIENVENIDA 1 (Embed Principal) ---
        if (config.welcome_1?.channelId) {
            const channelB1 = member.guild.channels.cache.get(config.welcome_1.channelId);
            if (channelB1) {
                // Usamos tu constructor del embedBuilder.js
                const { embed, content } = createWelcomeFarewellEmbed(member, config.welcome_1);
                
                channelB1.send({ 
                    content: content || null, 
                    embeds: [embed] 
                }).catch(err => console.log("Error enviando B1:", err));
            }
        }

        // --- 🔵 BIENVENIDA 2 (Solo Texto / Chat General) ---
        if (config.welcome_2?.channelId) {
            const channelB2 = member.guild.channels.cache.get(config.welcome_2.channelId);
            if (channelB2) {
                // Para B2, procesamos un mensaje simple si existe
                const realCount = member.guild.members.cache.filter(m => !m.user.bot).size;
                let msgB2 = config.welcome_2.desc || `✨ ¡Bienvenida {taguser}! Pásala lindo en **{serveruser}**. Eres nuestra persona nº{membercount}. 🌸`;
                
                // Reemplazo rápido para mensaje simple
                msgB2 = msgB2
                    .replace(/{taguser}/g, `<@${member.id}>`)
                    .replace(/{serveruser}/g, member.guild.name)
                    .replace(/{membercount}/g, realCount.toString())
                    .replace(/{username}/g, member.user.username);

                channelB2.send(msgB2).catch(err => console.log("Error enviando B2:", err));
            }
        }

        // --- 🎭 AUTOROLE (Opcional) ---
        // Si tienes guardados IDs de roles en tu config, el bot los asignará aquí
        const userRoleId = config.userRoleId; // ID de rol para humanos
        const botRoleId = config.botRoleId;   // ID de rol para bots

        if (member.user.bot && botRoleId) {
            member.roles.add(botRoleId).catch(() => {});
        } else if (!member.user.bot && userRoleId) {
            member.roles.add(userRoleId).catch(() => {});
        }
    }
};