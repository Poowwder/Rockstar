const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'yandere',
    description: 'Modo yandere activado... no te acerques 🔪',
    category: 'reaction',
    data: new SlashCommandBuilder()
        .setName('yandere')
        .setDescription('Modo yandere activado... no te acerques 🔪'),

    async execute(interaction) {
        try {
            // Llamamos al handler enviando 'yandere' como tipo
            const result = await runReaction(interaction.client, 'yandere', interaction.user);
            await interaction.reply(result);
        } catch (error) {
            console.error("Error en yandere command:", error);
            await interaction.reply({ content: "❌ El modo yandere falló... por ahora.", ephemeral: true });
        }
    }
};
