const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'gw-reset',
    async execute(message) {
        if (message.author.id !== message.guild.ownerId) return message.reply("🌸 Solo el dueño del server puede resetear todo. ✨");

        const peligro = "⚠️";
        const estrella = "✨";

        const embed = new EmbedBuilder()
            .setTitle(`${peligro} ¡Cuidado, Linda! ${peligro}`)
            .setDescription(
                `> 💎 **Acción:** \`Resetear Base de Datos\`\n\n` +
                `¿Estás segura de que quieres **borrar todos los datos** de los sorteos? Esta acción no se puede deshacer. ✨`
            )
            .setColor('#FF5555')
            .setFooter({ text: 'Confirmación de Seguridad • 🔒' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_reset').setLabel('Sí, borrar todo').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_reset').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await message.reply({ 
            content: `${estrella} **Espera un momento...** ${estrella}`,
            embeds: [embed], 
            components: [row] 
        });
    }
};