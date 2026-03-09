const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Muestra cómo te sientes con un contador ✨')
        .addSubcommand(sub => sub.setName('happy').setDescription('Muestra tu felicidad'))
        .addSubcommand(sub => sub.setName('cry').setDescription('Muestra tu tristeza'))
        .addSubcommand(sub => sub.setName('angry').setDescription('Muestra tu enojo'))
        .addSubcommand(sub => sub.setName('blush').setDescription('Muéstrate sonrojada'))
        .addSubcommand(sub => sub.setName('dance').setDescription('¡A bailar!'))
        .addSubcommand(sub => sub.setName('laugh').setDescription('Ríete un poco'))
        .addSubcommand(sub => sub.setName('sleep').setDescription('Tengo sueño'))
        .addSubcommand(sub => sub.setName('smug').setDescription('Presume un poco'))
        .addSubcommand(sub => sub.setName('thinking').setDescription('Estoy pensando'))
        .addSubcommand(sub => sub.setName('bored').setDescription('Qué aburrimiento')),
    
    async execute(interaction) {
        const type = interaction.options.getSubcommand();
        const result = await runReaction(interaction.client, type, interaction.user);
        await interaction.reply(result);
    }
};