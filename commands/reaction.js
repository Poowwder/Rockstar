const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Reacciones sociales y de afecto')
        .addSubcommand(s => s.setName('hug').setDescription('Abraza a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('kiss').setDescription('Besa a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('pat').setDescription('Acaricia a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('cuddle').setDescription('Cariñitos').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('bite').setDescription('Muerde a alguien').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('highfive').setDescription('Choca las palmas').addUserOption(o => o.setName('u').setDescription('Usuario').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('u');
        
        const embed = new EmbedBuilder()
            .setColor('#ff85a2')
            .setDescription(`${interaction.user} le dio un **${sub}** a ${target}`)
            .setImage(`https://neliel-api.vercel.app/api/${sub}`);

        return interaction.reply({ embeds: [embed] });
    }
};
