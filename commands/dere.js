const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'dere',
    description: '¡Muestra tu lado más tierno y enamorado! 💕',
    category: 'reaction',
    data: new SlashCommandBuilder()
        .setName('dere')
        .setDescription('¡Muestra tu lado más tierno y enamorado! 💕'),

    async execute(interaction) {
        try {
            // Llamamos al handler con el tipo 'dere'
            const result = await runReaction(interaction.client, 'dere', interaction.user);
            await interaction.reply(result);
        } catch (error) {
            console.error("Error en dere command:", error);
            await interaction.reply({ 
                content: "❌ ¡El amor falló! No pude cargar la reacción.", 
                ephemeral: true 
            });
        }
    }
};
