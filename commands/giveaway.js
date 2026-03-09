const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'giveaway',
    aliases: ['gw', 'sorteo'],
    description: 'Crea un sorteo con un estilo súper cute y aesthetic ✨',
    async execute(message, args) {
        // Configuraciones aesthetic
        const premio = args.join(" ") || "Un regalito misterioso 🎁";
        const rosaPastel = "#FFB7C5"; 
        const destello = "✨";
        const moño = "🎀";

        // 1. Construimos el Embed con estilo "Clean & Cute"
        const giveawayEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: '¡Nuevo Sorteo Iniciado!', 
                iconURL: message.guild.iconURL({ forceStatic: false }) 
            })
            .setTitle(`${destello} ${premio} ${destello}`)
            .setDescription(
                `> ${moño} **Anfitrión:** ${message.author}\n` +
                `> 📋 **Participantes:** \`0\`\n` +
                `> 🏆 **Ganadores:** \`1\`\n\n` +
                `¡Hola, linda! Para entrar en el sorteo solo tienes que presionar el botón de abajo. ¡Mucha suerte! 🌸`
            )
            .setColor(rosaPastel)
            .setThumbnail(message.author.displayAvatarURL({ forceStatic: false }))
            .setFooter({ 
                text: `ID: ${Math.floor(Math.random() * 99999)} • Termina en: 24h`,
                iconURL: message.client.user.displayAvatarURL()
            })
            .setTimestamp();

        // 2. Botones Estéticos
        const botones = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('join_giveaway')
                    .setLabel('Participar')
                    .setEmoji('🎀')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('view_list')
                    .setLabel('Lista')
                    .setEmoji('📜')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('end_gw')
                    .setLabel('Cerrar')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        // 3. Enviamos la respuesta
        await message.reply({
            content: `${destello} **¡Un nuevo sorteo ha aparecido!** ${destello}`,
            embeds: [giveawayEmbed],
            components: [botones]
        });
    },
};