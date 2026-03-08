const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configura el canal para los logs del servidor')
        .addChannelOption(opt => 
            opt.setName('canal')
                .setDescription('Canal donde se enviarán los logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');
        let config = {};

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        config.logChannelId = channel.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return interaction.reply(`✅ Canal de logs configurado en <#${channel.id}>.`);
    }
};