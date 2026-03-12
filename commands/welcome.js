const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

module.exports = {
    name: 'welcome',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('🌑 Panel de configuración de Bienvenidas y Despedidas Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ 
                content: '╰┈➤ ❌ No tienes autoridad para gestionar las fronteras de este dominio.', 
                ephemeral: true 
            });
        }

        // --- 👁️ SISTEMA DE LOGS (AUDITORÍA PURIFICADA) ---
        await sendAuditLog(interaction.guild, {
            title: '⊹ Acceso a Gestión de Fronteras ⊹',
            description: 
                `**Sujeto:** ${interaction.user.tag}\n\n` +
                `> *Se ha abierto el protocolo de configuración de ingresos y egresos del servidor.*`,
            color: '#1a1a1a',
            icon: interaction.user.displayAvatarURL()
        });

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Panel de Inmigración ⊹ Rockstar')
            .setDescription(
                `*“Controla quién cruza el umbral de las sombras...”*\n\n` +
                `📢 **B1:** Canal formal de bienvenidas (Embed detallado).\n` +
                `💬 **B2:** Saludo rápido para el sector de convivencia.\n` +
                `🥀 **Despedida:** Registro de almas que abandonan el dominio.`
            )
            .addFields(
                { name: '📋 Variables de Sistema', value: 'Puedes usar `{user}`, `{server}` y `{membercount}`.' }
            )
            .setColor('#1a1a1a')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Rockstar ⊹ Nightfall System', iconURL: interaction.client.user.displayAvatarURL() });

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
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👁️'),
            new ButtonBuilder()
                .setCustomId('conf_random')
                .setLabel('Diseño Aleatorio')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🌑')
        );

        // --- 📨 ENVÍO DEL PANEL (Aquí estaba el corte) ---
        await interaction.reply({ 
            embeds: [embed], 
            components: [rowConfig, rowExtra] 
        });
    }
};
