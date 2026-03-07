const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, calculateLevel } = require('../../economyManager.js'); // Ajusta la ruta si es necesario
const fs = require('fs');
const path = require('path');

const ICONS = {
    work: '💼',
    money: '🌸',
    error: '❌',
};

const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
    success: '#A7D7C5'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip_pick')
        .setDescription('Equipa un pico de mineria'),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

     
      
        const embed = new EmbedBuilder()
            .setTitle('Pico equipado')
            .setDescription('')
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed] });
    }
};




//const { calculateLevel } = require('../../economyManager.js');