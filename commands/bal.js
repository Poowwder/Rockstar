const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'bal',
    category: 'economía',
    aliases: ['money', 'coins'],
    async execute(message) {
        const target = message.mentions.users.first() || message.author;
        const data = await getUserData(target.id);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Flores de ${target.username}`, iconURL: target.displayAvatarURL() })
            .addFields(
                { name: '👛 Cartera', value: `\`${data.wallet.toLocaleString()}\` flores`, inline: true },
                { name: '🏦 Banco', value: `\`${data.bank.toLocaleString()}\` flores`, inline: true }
            )
            .setColor('#FFB6C1');

        message.reply({ embeds: [embed] });
    }
};