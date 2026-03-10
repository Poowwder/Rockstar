const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        // Obtenemos el modelo desde mongoose para buscar la config en la DB
        const GuildConfig = mongoose.models.GuildConfig;
        const data = await GuildConfig.findOne({ GuildID: member.guild.id });

        // Si no hay configuración de despedida o canal, cancelamos
        if (!data || !data.ByeConfig || !data.ByeConfig.channelId) return;

        const config = data.ByeConfig;
        const chan = member.guild.channels.cache.get(config.channelId);
        if (!chan) return;

        // Contador real (excluyendo bots)
        const realMemberCount = member.guild.members.cache.filter(m => !m.user.bot).size;

        // Sistema de reemplazo de variables (Súper útil para el usuario)
        const replaceVars = (text) => {
            if (!text) return "";
            return text
                .replace(/{username}/g, member.user.username)
                .replace(/{taguser}/g, member.user.tag)
                .replace(/{user}/g, member.user.toString()) // Añadí mención por si acaso
                .replace(/{serveruser}/g, member.guild.name)
                .replace(/{server}/g, member.guild.name)
                .replace(/{membercount}/g, realMemberCount.toString());
        };

        const embed = new EmbedBuilder()
            .setColor(config.color || '#FF6961')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        // Aplicamos los textos del Modal procesados por las variables
        if (config.title) embed.setTitle(replaceVars(config.title));
        if (config.desc) embed.setDescription(replaceVars(config.desc));
        if (config.image) embed.setImage(config.image);
        
        // El footer ahora usa el icono del servidor automáticamente
        embed.setFooter({ 
            text: `Ahora somos ${realMemberCount} miembros en ${member.guild.name}`, 
            iconURL: member.guild.iconURL() 
        });

        // Siempre mandamos el timestamp para que se sepa cuándo se fue exactamente
        embed.setTimestamp();

        try {
            await chan.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Error al enviar despedida:", error.message);
        }
    }
};