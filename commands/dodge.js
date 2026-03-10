const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'dodge',
    description: '¡Intenta esquivar un ataque con estilo! 💨',
    category: 'reaction',
    data: new SlashCommandBuilder()
        .setName('dodge')
        .setDescription('¡Intenta esquivar un ataque con estilo! 💨'),

    async execute(interaction) {
        // En lugar de un subcomando, ejecutamos directamente la acción de "dodge"
        try {
            // Usamos el handler de reacciones pero fijando el tipo a 'dodge'
            const result = await runReaction(interaction.client, 'dodge', interaction.user);
            
            // Si el resultado es un objeto de embed, lo enviamos
            await interaction.reply(result);
        } catch (error) {
            console.error("Error en dodge command:", error);
            await interaction.reply({ 
                content: "❌ No pudiste esquivar a tiempo... (Error al cargar la reacción)", 
                ephemeral: true 
            });
        }
    }
};
