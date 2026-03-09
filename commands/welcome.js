const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'welcome',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('🎀 Panel de configuración de Bienvenidas/Despedidas')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Panel de Configuración Rockstar')
            .setDescription(
                'Selecciona una opción para configurar o ver cómo está quedando el diseño.\n\n' +
                '📢 **B1:** Canal principal de bienvenidas.\n' +
                '💬 **B2:** Saludo corto para el Chat General.\n' +
                '👋 **Despedida:** Mensaje de salida.'
            )
            .setColor('#FFB6C1');

        // Fila 1: Configuración
        const rowConfig = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('conf_welcome_1').setLabel('Configurar B1').setStyle(ButtonStyle.Primary).setEmoji('📢'),
            new ButtonBuilder().setCustomId('conf_welcome_2').setLabel('Configurar B2').setStyle(ButtonStyle.Primary).setEmoji('💬'),
            new ButtonBuilder().setCustomId('conf_despedida').setLabel('Configurar Despedida').setStyle(ButtonStyle.Danger).setEmoji('👋')
        );

        // Fila 2: Vista Previa y Random
        const rowExtra = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('conf_random').setLabel('Generar Random ✨').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('conf_preview').setLabel('👀 Vista Previa').setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [rowConfig, rowExtra] });
    }
};