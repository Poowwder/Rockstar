const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'gw-list',
    aliases: ['sorteos-lista'],
    async execute(message) {
        const estrella = "✨";
        const moño = "🎀";

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Lista de Sorteos ✨', iconURL: message.guild.iconURL({ forceStatic: false }) })
            .setTitle(`${estrella} Sorteos en Curso ${estrella}`)
            .setDescription(
                `> ${moño} **Estado:** \`No hay sorteos activos\`\n\n` +
                `¡Hola, linda! Actualmente no hay dinámicas activas. ¡Crea una con \`!!giveaway\`! 🌸`
            )
            .setColor('#FFB7C5')
            .setFooter({ text: 'Lista de Premios • ✨' })
            .setTimestamp();

        await message.reply({ 
            content: `${estrella} **Aquí tienes la información, reina.** ${estrella}`,
            embeds: [embed] 
        });
    }
};