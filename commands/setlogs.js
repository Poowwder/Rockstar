const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configura el canal para los logs del servidor')
        .addChannelOption(opt => 
            opt.setName('canal')
                .setDescription('Canal de texto para auditoría')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');
        const configPath = path.join(__dirname, '../data/config.json');

        // Crear carpeta si no existe
        if (!fs.existsSync(path.dirname(configPath))) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }

        const config = { logChannelId: channel.id };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return interaction.reply(`✅ Sistema de logs activado en <#${channel.id}>.`);
    }
};