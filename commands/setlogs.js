const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Modelo central
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos para el log de prueba

module.exports = {
    name: 'setlogs',
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('🌑 Configura el núcleo de vigilancia para Rockstar.')
        .addChannelOption(opt => 
            opt.setName('canal')
                .setDescription('El sector donde las sombras registrarán cada movimiento.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');

        try {
            // --- 💾 ACTUALIZACIÓN EN EL BÚNKER (MONGODB) ---
            await GuildConfig.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { LogChannelID: channel.id },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setTitle('👁️ PROTOCOLO DE VIGILANCIA: ACTIVADO')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setDescription(
                    `*“El ojo de Rockstar se ha abierto en este sector.”*\n\n` +
                    `╰┈➤ **Núcleo de Auditoría:** ${channel}\n` +
                    `> *A partir de ahora, cada alteración del dominio será archivada aquí para la posteridad.*`
                )
                .setFooter({ text: 'Rockstar ⊹ Nightfall Edition', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            // Respuesta efímera para el administrador
            await interaction.reply({ embeds: [embed], ephemeral: true });

            // --- 👁️ LOG DE INICIACIÓN ---
            // Enviamos el primer reporte al nuevo canal para confirmar que funciona
            await sendAuditLog(interaction.guild, {
                title: '⊹ Enlace de Vigilancia Sincronizado ⊹',
                description: 
                    `**Estado:** Operativo\n` +
                    `**Sector:** ${channel}\n` +
                    `**Administrador:** ${interaction.user.tag}\n` +
                    `> *Este canal ha sido designado como el registro oficial de auditoría Rockstar.*`,
                color: '#1a1a1a',
                icon: interaction.user.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en setlogs:", error);
            return interaction.reply({ 
                content: '╰┈➤ ❌ Fallo crítico en el enlace con el núcleo de datos. Revisa la conexión de MongoDB.', 
                ephemeral: true 
            });
        }
    }
};
