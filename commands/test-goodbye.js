const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createWelcomeFarewellEmbed } = require('../events/embedBuilder.js');

const configPath = path.join(__dirname, '..', 'goodbyeConfig.json');

function getGoodbyeConfig(guildId) {
    if (!fs.existsSync(configPath)) return null;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config[guildId];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-goodbye')
        .setDescription('Previsualiza el embed de despedida (solo para administradores).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'manager',
    description: 'Previsualiza el embed de despedida (solo para administradores).',
    usage: '!!test-goodbye',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Este comando solo puede ser usado por administradores.');
        }

        const config = getGoodbyeConfig(message.guild.id);
        if (!config || !config.channelId) {
            return message.reply('La configuración de despedida no ha sido establecida.');
        }

        const { embed, content } = createWelcomeFarewellEmbed(message.member, config);
        await message.reply({ content: content || 'Esta es una vista previa del embed de despedida:', embeds: [embed] });
    },
    async executeSlash(interaction) {
        const config = getGoodbyeConfig(interaction.guild.id);
        if (!config || !config.channelId) {
            return interaction.reply({ content: 'La configuración de despedida no ha sido establecida.', flags: MessageFlags.Ephemeral });
        }

        const { embed, content } = createWelcomeFarewellEmbed(interaction.member, config);
        await interaction.reply({ content: content || undefined, embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};