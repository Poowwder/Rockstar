const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'gw-help',
    async execute(message) {
        const estrella = "✨";
        const moño = "🎀";

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Guía de Sorteos ✨', iconURL: message.client.user.displayAvatarURL() })
            .setTitle(`${moño} Menú de Ayuda ${moño}`)
            .setDescription(
                `🌸 **Comandos para ti:**\n` +
                `\`!!giveaway\` ${estrella} Crea un nuevo sorteo.\n` +
                `\`!!gw-list\` ${estrella} Mira los sorteos activos.\n\n` +
                `👑 **Comandos Staff:**\n` +
                `\`!!gw-config\` ${estrella} Ajustes del sistema.\n` +
                `\`!!gw-reset\` ${estrella} Limpiar base de datos.`
            )
            .setColor('#FFB7C5')
            .setFooter({ text: 'Cualquier duda, avísame. 💍' })
            .setTimestamp();

        await message.reply({ 
            content: `${estrella} **¡Aquí tienes la guía completa!** ${estrella}`,
            embeds: [embed] 
        });
    }
};