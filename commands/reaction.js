const { SlashCommandBuilder } = require('discord.js');
const { runReaction } = require('../utils/reactionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Muestra cómo te sientes con un GIF ✨')
        .addSubcommand(sub => sub.setName('angry').setDescription('Muestra tu enojo 💢'))
        .addSubcommand(sub => sub.setName('blush').setDescription('Te sonrojaste 😊'))
        .addSubcommand(sub => sub.setName('boonk').setDescription('¡Boonk! 💥'))
        .addSubcommand(sub => sub.setName('bored').setDescription('Estás aburrida 😑'))
        .addSubcommand(sub => sub.setName('bye').setDescription('Dí adiós 👋'))
        .addSubcommand(sub => sub.setName('confused').setDescription('Estás confundida ❓'))
        .addSubcommand(sub => sub.setName('cringe').setDescription('¡Qué cringe! 😬'))
        .addSubcommand(sub => sub.setName('cry').setDescription('Estás llorando 😭'))
        .addSubcommand(sub => sub.setName('dance').setDescription('¡A bailar! 💃'))
        .addSubcommand(sub => sub.setName('dere').setDescription('¡Estás muy enamorada! 💕')) // <--- NUEVO
        .addSubcommand(sub => sub.setName('dodge').setDescription('¡Esquiva con estilo! 💨'))
        .addSubcommand(sub => sub.setName('grafitti').setDescription('Haz un graffiti 🎨'))
        .addSubcommand(sub => sub.setName('happy').setDescription('Estás feliz ✨'))
        .addSubcommand(sub => sub.setName('hi').setDescription('Dí hola! 👋'))
        .addSubcommand(sub => sub.setName('laugh').setDescription('Ríete un poco 😂'))
        .addSubcommand(sub => sub.setName('paint').setDescription('Ponte a pintar 🖌️'))
        .addSubcommand(sub => sub.setName('panic').setDescription('¡Entra en pánico! 😱'))
        .addSubcommand(sub => sub.setName('pout').setDescription('Haz un puchero 😤'))
        .addSubcommand(sub => sub.setName('run').setDescription('¡Corre! 🏃‍♀️'))
        .addSubcommand(sub => sub.setName('scared').setDescription('Tienes miedo 😨'))
        .addSubcommand(sub => sub.setName('shrug').setDescription('Encógete de hombros 🤷‍♀️'))
        .addSubcommand(sub => sub.setName('sip').setDescription('Bebe algo 🥤'))
        .addSubcommand(sub => sub.setName('sleep').setDescription('Tengo sueño 💤'))
        .addSubcommand(sub => sub.setName('smug').setDescription('Presume un poco 😏'))
        .addSubcommand(sub => sub.setName('thinking').setDescription('Estás pensando 🤔'))
        .addSubcommand(sub => sub.setName('wave').setDescription('Saluda con la mano 👋'))
        .addSubcommand(sub => sub.setName('wink').setDescription('Guiña un ojo 😉'))
        .addSubcommand(sub => sub.setName('scream').setDescription('¡Grita fuerte! 😫'))
        .addSubcommand(sub => sub.setName('yandere').setDescription('Modo yandere activado 🔪')),

    async execute(interaction) {
        try {
            const type = interaction.options.getSubcommand();
            const result = await runReaction(interaction.client, type, interaction.user);
            await interaction.reply(result);
        } catch (error) {
            console.error("Error en el comando reaction:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Ocurrió un error al procesar la reacción.", ephemeral: true });
            }
        }
    }
};