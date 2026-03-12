const { GuildConfig } = require('../data/mongodb.js'); 
const { createWelcomeFarewellEmbed } = require('./embedBuilder.js'); // El procesador central

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const { guild } = member;

        // 1. Localizamos el expediente del servidor en MongoDB
        const config = await GuildConfig.findOne({ GuildID: guild.id });
        
        // Si no hay configuración o no se definió un canal de despedida, abortamos
        if (!config || !config.ByeConfig || !config.ByeConfig.channelId) return;

        const channel = guild.channels.cache.get(config.ByeConfig.channelId);
        if (!channel) return;

        try {
            // --- 🥀 PROCESAMIENTO DE SALIDA ---
            // Usamos nuestro procesador central para traducir variables y aplicar estética
            const { embed, content } = createWelcomeFarewellEmbed(member, config.ByeConfig);

            // Enviamos el último adiós al canal designado
            await channel.send({ 
                content: content || null, 
                embeds: [embed] 
            });

        } catch (error) {
            console.error("╰┈➤ ❌ Error en el protocolo de despedida:", error.message);
        }
    }
};
