const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');

module.exports = {
    name: 'welcome',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('🎀 Panel de configuración de Bienvenidas y Despedidas Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Panel de Configuración Rockstar')
            .setDescription(
                'Personaliza la entrada y salida de tus usuarios con un diseño estético.\n\n' +
                '📢 **B1:** Canal principal de bienvenidas (Embed grande).\n' +
                '💬 **B2:** Saludo corto para el Chat General (Más simple).\n' +
                '👋 **Despedida:** Mensaje cuando alguien nos abandona.'
            )
            .addFields(
                { name: '✨ Tip de Reemplazos', value: 'Usa `{user}`, `{server}` y `{membercount}` en tus mensajes.' }
            )
            .setColor('#FFB6C1')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        // Fila 1: Botones que disparan los Modales en el index.js
        const rowConfig = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_welcome_1')
                .setLabel('Configurar B1')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('conf_welcome_2')
                .setLabel('Configurar B2')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💬'),
            new ButtonBuilder()
                .setCustomId('conf_despedida')
                .setLabel('Despedida')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('👋')
        );

        // Fila 2: Herramientas adicionales
        const rowExtra = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_preview')
                .setLabel('Vista Previa')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👀'),
            new ButtonBuilder()
                .setCustomId('conf_random')
                .setLabel('Diseño Random ✨')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [rowConfig, rowExtra],
            ephemeral: true 
        });
    }
};