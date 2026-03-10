const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler');

module.exports = {
    name: 'scream',
    description: '¡Pega un grito con todas tus fuerzas! 😫',
    category: 'reaction',
    data: new SlashCommandBuilder()
        .setName('scream')
        .setDescription('¡Pega un grito con todas tus fuerzas! 😫'),

    async execute(interaction) {
        try {
            // Llamamos al handler enviando 'scream' como tipo
            const result = await runReaction(interaction.client, 'scream', interaction.user);
            await interaction.reply(result);
        } catch (error) {
            console.error("Error en scream command:", error);
            await interaction.reply({ content: "❌ ¡No pude gritar! (Error al cargar la reacción)", ephemeral: true });
        }
    }
};