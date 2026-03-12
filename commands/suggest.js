const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { Suggestion } = require('../data/mongodb.js'); 
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'suggest',
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('🌑 Propón una alteración o mejora para el dominio.')
        .addStringOption(option => 
            option.setName('contenido')
                .setDescription('Describe tu propuesta detalladamente para las sombras.')
                .setRequired(true)),

    async execute(interaction) {
        // --- 🕵️ DETECCIÓN AUTOMÁTICA DEL SECTOR ---
        const suggestChannel = interaction.guild.channels.cache.find(c => 
            c.name.toLowerCase() === 'sugerencias' || 
            c.name.toLowerCase() === 'suggestions'
        );

        if (!suggestChannel) {
            return interaction.reply({ 
                content: '╰┈➤ ❌ No se detectó un sector de `#sugerencias`. Configura el canal para procesar propuestas.', 
                ephemeral: true 
            });
        }

        const suggestionText = interaction.options.getString('contenido');

        // --- 🎨 EMBED DE LA PROPUESTA (ESTÉTICA ROCKSTAR) ---
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `Propuesta de ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`*“Una nueva idea emerge de las sombras...”*\n\n**Contenido:**\n${suggestionText}`)
            .setColor('#1a1a1a') // Negro Rockstar
            .addFields(
                { name: '📊 Estado', value: '⏳ Bajo evaluación...', inline: false },
                { name: '👍 Votos a favor', value: '`0`', inline: true },
                { name: '👎 Votos en contra', value: '`0`', inline: true }
            )
            .setFooter({ text: 'Rockstar ⊹ Vigilance Proposals', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        // Botones en estilo Secondary (Oscuros) y Danger para gestión
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vote_up').setEmoji('👍').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('vote_down').setEmoji('👎').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('manage_suggest').setLabel('Gestionar').setStyle(ButtonStyle.Danger)
        );

        try {
            const msg = await suggestChannel.send({ embeds: [embed], components: [row] });

            // --- 🗄️ ARCHIVADO EN BASE DE DATOS ---
            await new Suggestion({
                MessageID: msg.id,
                GuildID: interaction.guild.id,
                AuthorID: interaction.user.id,
                UpVoters: [],
                DownVoters: []
            }).save();

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(interaction.guild, {
                title: '⊹ Propuesta Registrada ⊹',
                description: 
                    `**Autor:** ${interaction.user.tag}\n` +
                    `**Canal:** ${suggestChannel}\n` +
                    `**Snippet:** \`${suggestionText.substring(0, 50)}...\`\n` +
                    `> *Se ha emitido una nueva sugerencia para el desarrollo del dominio.*`,
                color: '#1a1a1a',
                icon: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ 
                content: `╰┈➤ 🌑 Tu propuesta ha sido enviada al canal de ${suggestChannel}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Error en el comando suggest:", error);
            await interaction.reply({ 
                content: '╰┈➤ ❌ Las sombras rechazaron tu propuesta. Revisa mis permisos en el canal de destino.', 
                ephemeral: true 
            });
        }
    }
};
