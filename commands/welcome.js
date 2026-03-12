const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');

module.exports = {
    name: 'welcome',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('🌑 Panel de configuración de Bienvenidas y Despedidas Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // --- 🛡️ VALIDACIÓN DE SEGURIDAD ---
        if (interaction.member && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ 
                content: '╰┈➤ ❌ No tienes autoridad para gestionar las fronteras de este dominio.', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Panel de Inmigración ⊹ Rockstar')
            .setDescription(
                `*“Controla quién cruza el umbral de las sombras...”*\n\n` +
                `📢 **B1:** Canal principal de bienvenidas (Embed formal).\n` +
                `💬 **B2:** Saludo rápido para el chat general.\n` +
                `👋 **Despedida:** Registro de almas que abandonan el dominio.`
            )
            .addFields(
                { name: '📋 Variables Disponibles', value: 'Usa `{user}`, `{server}` y `{membercount}` en tus mensajes.' }
            )
            .setColor('#1a1a1a') // Negro Rockstar
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Rockstar ⊹ Nightfall Edition', iconURL: interaction.client.user.displayAvatarURL() });

        // --- 🔘 FILA 1: CONFIGURACIÓN ---
        const rowConfig = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_welcome_1')
                .setLabel('Configurar B1')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('conf_welcome_2')
                .setLabel('Configurar B2')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('💬'),
            new ButtonBuilder()
                .setCustomId('conf_despedida')
                .setLabel('Despedida')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🥀')
        );

        // --- 🔘 FILA 2: HERRAMIENTAS ---
        const rowExtra = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('conf_preview')
                .setLabel('Vista Previa')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👁️'),
            new ButtonBuilder()
                .setCustomId('conf_random')
                .setLabel('Diseño Aleatorio')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🌑')
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [rowConfig, rowExtra],
            ephemeral: true 
        });
    }
};
