const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('Acciones de combate o físicas')
        .addSubcommand(s => s.setName('slap').setDescription('Da una bofetada').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('kill').setDescription('Mata a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('punch').setDescription('Da un golpe').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('kick').setDescription('Patea a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('bonk').setDescription('A la horny jail').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('yeet').setDescription('Lanza a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('u');
        
        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setDescription(`${interaction.user} realizó **${sub}** sobre ${target}`)
            .setImage(`https://neliel-api.vercel.app/api/${sub}`);

        return interaction.reply({ embeds: [embed] });
    }
};