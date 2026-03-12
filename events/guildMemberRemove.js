const { GuildConfig } = require('../data/mongodb.js'); 
const { createWelcomeFarewellEmbed } = require('./embedBuilder.js'); // El procesador central

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const { guild } = member;

        // --- 📊 CONTADORES DEL IMPERIO (Se ejecuta siempre al salir alguien) ---
        const canalTotales = guild.channels.cache.find(c => c.name.startsWith('🌍 Totales:'));
        const canalHumanos = guild.channels.cache.find(c => c.name.startsWith('👤 Humanos:'));

        if (canalTotales || canalHumanos) {
            const totalMembers = guild.memberCount;
            const humanMembers = guild.members.cache.filter(m => !m.user.bot).size;

            try {
                if (canalTotales) await canalTotales.setName(`🌍 Totales: ${totalMembers}`);
                if (canalHumanos) await canalHumanos.setName(`👤 Humanos: ${humanMembers}`);
            } catch (error) {
                // Silenciamos el límite restrictivo de Discord (2 renombrados cada 10 mins)
            }
        }

        // --- 🗄️ CONEXIÓN A LA MATRIZ DE DATOS ---
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
