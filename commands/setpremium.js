const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setpremium')
        .setDescription('Asigna nivel premium a un usuario')
        .addUserOption(o => o.setName('user').setRequired(true))
        .addStringOption(o => o.setName('tipo').setRequired(true).addChoices(
            { name: 'Normal', value: 'normal' },
            { name: 'Mensual', value: 'mensual' },
            { name: 'Bimestral', value: 'bimestral' }
        ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const type = interaction.options.getString('tipo');
        
        const data = await getUserData(target.id);
        data.premiumType = type;
        await updateUserData(target.id, data);

        return interaction.reply(`🌟 <@${target.id}> ahora es nivel **${type.toUpperCase()}**.`);
    }
};