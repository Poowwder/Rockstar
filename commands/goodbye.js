const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'goodbye',
    data: new SlashCommandBuilder()
        .setName('goodbye')
        .setDescription('🌑 Panel de configuración de Despedidas Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // --- 👁️ LOG AUTOMÁTICO DE ACCESO ---
        await sendAuditLog(interaction.guild, {
            title: '⊹ Acceso a Configuración de Despedidas ⊹',
            description: `**Operador:** ${interaction.user.tag}\n> *Se ha abierto el registro de clausura de almas.*`,
            icon: interaction.user.displayAvatarURL()
        });

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Registro de Deserciones ⊹ Rockstar')
            .setDescription(
                `*“Cuando un alma abandona el dominio, las sombras lo registran...”*\n\n` +
                `🖼️ **Configurar:** Diseña el mensaje final que se enviará en este canal.\n` +
                `👁️ **Nota:** El sistema detectará automáticamente la salida y ejecutará el protocolo.`
            )
            .addFields(
                { name: '📋 Variables Permitidas', value: '`{user}`, `{server}` y `{membercount}`' }
            )
            .setColor('#1a1a1a') // Negro Rockstar
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Rockstar ⊹ Protocolo de Salida', iconURL: interaction.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_despedida')
                .setLabel('Configurar Mensaje')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🥀'), // Emoji de flor marchita para la despedida
            new ButtonBuilder()
                .setCustomId('conf_preview_bye')
                .setLabel('Vista Previa')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👁️')
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    }
};
