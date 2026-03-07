const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('A simple fishing command for testing purposes.'),
    category: 'currency',
    async execute(message, args) {
        try {
            await message.reply('Fish command executed successfully!');
        } catch (error) {
            console.error('Error executing fish command:', error);
            await message.reply('There was an error executing this command.');
        }
    },
    async executeSlash(interaction) {
        await interaction.reply('Slash fish command executed successfully!');
    },
};