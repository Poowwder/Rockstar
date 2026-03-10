const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
// Importamos directamente el modelo desde tu nueva central de datos
const { Suggestion } = require('../data/mongodb.js'); 

module.exports = {
    name: 'suggest',
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('💡 Envía una sugerencia para mejorar el servidor')
        .addStringOption(option => 
            option.setName('contenido')
                .setDescription('Describe tu idea detalladamente')
                .setRequired(true)),

    async execute(interaction) {
        // --- 🕵️ DETECCIÓN AUTOMÁTICA DEL CANAL ---
        const suggestChannel = interaction.guild.channels.cache.find(c => 
            c.name.toLowerCase() === 'sugerencias' || 
            c.name.toLowerCase() === 'suggestions'
        );

        if (!suggestChannel) {
            return interaction.reply({ 
                content: '❌ No encontré ningún canal llamado `#sugerencias`. Por favor, crea uno para que el sistema funcione.', 
                ephemeral: true 
            });
        }

        const suggestionText = interaction.options.getString('contenido');

        // --- 🎨 EMBED DE LA SUGERENCIA ---
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `Sugerencia de ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`**Idea:**\n${suggestionText}`)
            .setColor('#B5EAD7')
            .addFields(
                { name: '📊 Estado', value: '⏳ Esperando votos...', inline: false },
                { name: '✅ Votos positivos', value: '0', inline: true },
                { name: '❌ Votos negativos', value: '0', inline: true }
            )
            .setFooter({ text: 'Rockstar Suggestions System ✨' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vote_up').setEmoji('✅').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('vote_down').setEmoji('❌').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('manage_suggest').setLabel('Gestionar').setEmoji('🛠️').setStyle(ButtonStyle.Secondary)
        );

        try {
            const msg = await suggestChannel.send({ embeds: [embed], components: [row] });

            // Guardamos en MongoDB usando el modelo importado
            await new Suggestion({
                MessageID: msg.id,
                GuildID: interaction.guild.id,
                AuthorID: interaction.user.id,
                UpVoters: [],
                DownVoters: []
            }).save();

            await interaction.reply({ 
                content: `✅ ¡Tu sugerencia ha sido enviada a ${suggestChannel}!`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Error en Suggest:", error);
            await interaction.reply({ content: '❌ Error al enviar la sugerencia. Revisa mis permisos.', ephemeral: true });
        }
    }
};