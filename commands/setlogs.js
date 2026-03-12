const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // <--- Importamos el modelo central

module.exports = {
    name: 'setlogs',
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('⚙️ Configura el canal de auditoría para Rockstar.')
        .addChannelOption(opt => 
            opt.setName('canal')
                .setDescription('Canal de texto para logs y auditoría')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');

        try {
            // Usamos el modelo que ya está definido en mongodb.js (Intacto)
            await GuildConfig.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { LogChannelID: channel.id },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setTitle('👁️ PROTOCOLO DE VIGILANCIA: ACTIVADO')
                .setDescription(`> *Las sombras ahora observan cada movimiento en este servidor.*\n\n╰┈➤ Sistema de auditoría vinculado a ${channel}.`);

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Error en setlogs:", error);
            return interaction.reply({ 
                content: '╰┈➤ ❌ Error al conectar con la base de datos central.', 
                ephemeral: true 
            });
        }
    }
};
