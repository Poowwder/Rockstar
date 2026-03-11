const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler.js');

// --- 📋 LISTA MAESTRA DE REACCIONES ---
const REACCIONES = [
    { name: 'angry 💢', value: 'angry' },
    { name: 'blush 😊', value: 'blush' },
    { name: 'boonk 💥', value: 'boonk' },
    { name: 'bored 😑', value: 'bored' },
    { name: 'bye 👋', value: 'bye' },
    { name: 'confused ❓', value: 'confused' },
    { name: 'cringe 😬', value: 'cringe' },
    { name: 'cry 😭', value: 'cry' },
    { name: 'dance 💃', value: 'dance' },
    { name: 'dere 💕', value: 'dere' },
    { name: 'dodge 💨', value: 'dodge' },
    { name: 'grafitti 🎨', value: 'grafitti' },
    { name: 'happy ✨', value: 'happy' },
    { name: 'hi 👋', value: 'hi' },
    { name: 'laugh 😂', value: 'laugh' },
    { name: 'paint 🖌️', value: 'paint' },
    { name: 'panic 😱', value: 'panic' },
    { name: 'pout 😤', value: 'pout' },
    { name: 'run 🏃‍♀️', value: 'run' },
    { name: 'scared 😨', value: 'scared' },
    { name: 'shrug 🤷‍♀️', value: 'shrug' },
    { name: 'sip 🥤', value: 'sip' },
    { name: 'sleep 💤', value: 'sleep' },
    { name: 'smug 😏', value: 'smug' },
    { name: 'thinking 🤔', value: 'thinking' },
    { name: 'wave 👋', value: 'wave' },
    { name: 'wink 😉', value: 'wink' },
    { name: 'scream 😫', value: 'scream' },
    { name: 'yandere 🔪', value: 'yandere' }
];

module.exports = {
    name: 'reaction',
    description: 'Expresa tus emociones a través del sistema ✨',
    category: 'reacción',
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Muestra cómo te sientes con un GIF ✨')
        .addStringOption(opt => 
            opt.setName('emocion')
            .setDescription('Empieza a escribir la emoción que quieres expresar...')
            .setRequired(true)
            .setAutocomplete(true) // 🔥 ESTO ROMPE EL LÍMITE
        ),

    // --- 🔍 MOTOR DE BÚSQUEDA EN VIVO ---
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        // Filtramos la lista dependiendo de lo que el usuario esté escribiendo
        const filtered = REACCIONES.filter(r => r.name.toLowerCase().includes(focusedValue));
        
        // Le devolvemos a Discord máximo 25 opciones a la vez para que no crashee
        await interaction.respond(filtered.slice(0, 25));
    },

    async execute(interaction) {
        try {
            // Ya no es un subcomando, es un StringOption
            const type = interaction.options.getString('emocion');
            
            const result = await runReaction(interaction, type);
            await interaction.reply(result);
            
        } catch (error) {
            console.error("Error en el comando reaction:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "> ❌ Las sombras interfirieron con tu reacción.", ephemeral: true });
            }
        }
    }
};
