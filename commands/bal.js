const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'bal',
    aliases: ['balance', 'money', 'flores'],
    async execute(message, args) {
        // Si mencionan a alguien, vemos su balance. Si no, el propio.
        const target = message.mentions.users.first() || message.author;
        const data = await getUserData(target.id);

        const embed = new EmbedBuilder()
            .setTitle(`🌸 Balance de ${target.username}`)
            .setColor('#FFB6C1')
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: '👛 Cartera', value: `\`${data.wallet.toLocaleString()}\` flores`, inline: true },
                { name: '🏦 Banco', value: `\`${data.bank.toLocaleString()}\` flores`, inline: true },
                { name: '✨ Total', value: `\`${(data.wallet + data.bank).toLocaleString()}\` flores` }
            )
            .setFooter({ text: 'Rockstar Bot Economy' });

        message.reply({ embeds: [embed] });
    }
};