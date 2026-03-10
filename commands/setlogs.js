const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // <--- Importamos el modelo central

module.exports = {
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

        // Usamos el modelo que ya está definido en mongodb.js
        await GuildConfig.findOneAndUpdate(
            { GuildID: interaction.guild.id },
            { LogChannelID: channel.id },
            { upsert: true }
        );

        return interaction.reply({ 
            content: `✅ Sistema de auditoría vinculado a ${channel}. ¡Rockstar ahora vigila! 🌸`, 
            ephemeral: true 
        });
    }
};