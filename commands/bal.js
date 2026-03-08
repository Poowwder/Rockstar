const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Consulta tu saldo actual')
        .addUserOption(opt => opt.setName('usuario').setDescription('Ver el saldo de otro usuario')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Saldo de ${target.username}`, iconURL: target.displayAvatarURL() })
            .addFields(
                { name: '👛 Cartera', value: `\`${data.wallet || 0} 🌸\``, inline: true },
                { name: '🏦 Banco', value: `\`${data.bank || 0} 🌸\``, inline: true }
            )
            .setColor('#FFB6C1');

        return interaction.reply({ embeds: [embed] });
    }
};