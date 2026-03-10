const { SlashCommandBuilder } = require('discord.js');
const { runAction } = require('../utils/actionHandler.js');

module.exports = {
    name: 'action',
    description: 'Interactúa con otros usuarios en el servidor ✨',
    category: 'interacción', // Agregado para que tu help.js lo organice bien
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('Interactúa con otros usuarios ✨')
        .addSubcommand(sub => sub.setName('bite').setDescription('Muerde a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién morder').setRequired(true)))
        .addSubcommand(sub => sub.setName('bully').setDescription('Molesta a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién molestar').setRequired(true)))
        .addSubcommand(sub => sub.setName('clap').setDescription('Apláudele a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién aplaudir').setRequired(true)))
        .addSubcommand(sub => sub.setName('cuddle').setDescription('Acurrúcate con alguien').addUserOption(opt => opt.setName('user').setDescription('Con quién acurrucarse').setRequired(true)))
        .addSubcommand(sub => sub.setName('feed').setDescription('Dale de comer a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién alimentar').setRequired(true)))
        .addSubcommand(sub => sub.setName('handhold').setDescription('Toma la mano de alguien').addUserOption(opt => opt.setName('user').setDescription('A quién tomar la mano').setRequired(true)))
        .addSubcommand(sub => sub.setName('highfive').setDescription('Choca esos cinco').addUserOption(opt => opt.setName('user').setDescription('Con quién chocar manos').setRequired(true)))
        .addSubcommand(sub => sub.setName('hug').setDescription('Abraza a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién abrazar').setRequired(true)))
        .addSubcommand(sub => sub.setName('kill').setDescription('Mata a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién matar').setRequired(true)))
        .addSubcommand(sub => sub.setName('kiss').setDescription('Besa a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién besar').setRequired(true)))
        .addSubcommand(sub => sub.setName('lick').setDescription('Lame a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién lamer').setRequired(true)))
        .addSubcommand(sub => sub.setName('nom').setDescription('Dale un mordisquito a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién morder').setRequired(true)))
        .addSubcommand(sub => sub.setName('pat').setDescription('Acaricia a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién acariciar').setRequired(true)))
        .addSubcommand(sub => sub.setName('poke').setDescription('Pica a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién picar').setRequired(true)))
        .addSubcommand(sub => sub.setName('punch').setDescription('Dale un puñetazo a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién golpear').setRequired(true)))
        .addSubcommand(sub => sub.setName('shoot').setDescription('Dispárale a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién disparar').setRequired(true)))
        .addSubcommand(sub => sub.setName('slap').setDescription('Dale una cachetada a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién abofetear').setRequired(true)))
        .addSubcommand(sub => sub.setName('spank').setDescription('Dale una nalgada a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién azotar').setRequired(true)))
        .addSubcommand(sub => sub.setName('splash').setDescription('Salpica a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién salpicar').setRequired(true)))
        .addSubcommand(sub => sub.setName('spray').setDescription('Rocía a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién rociar').setRequired(true)))
        .addSubcommand(sub => sub.setName('stare').setDescription('Mira fijamente a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién mirar').setRequired(true)))
        .addSubcommand(sub => sub.setName('sue').setDescription('Demanda a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién demandar').setRequired(true)))
        .addSubcommand(sub => sub.setName('tickle').setDescription('Hazle cosquillas a alguien').addUserOption(opt => opt.setName('user').setDescription('A quién hacer cosquillas').setRequired(true)))
        .addSubcommand(sub => sub.setName('yeet').setDescription('Lanza a alguien por los aires').addUserOption(opt => opt.setName('user').setDescription('A quién lanzar').setRequired(true))),

    async execute(interaction) {
        // Obtenemos qué acción eligió y a quién mencionó
        const type = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        
        // 🚀 NUEVO: Le pasamos directamente la 'interaction' al Handler
        const result = await runAction(interaction, type, target);
        
        await interaction.reply(result);
    }
};
