const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'bal',
    aliases: ['balance', 'money'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('🌸 Revisa tu monedero y tu cuenta bancaria')
        .addUserOption(option => option.setName('usuario').setDescription('Ver el balance de alguien más')),

    async execute(input) {
        const isSlash = !!input.user;
        const target = isSlash ? (input.options.getUser('usuario') || input.user) : (input.mentions.users.first() || input.author);
        const targetMember = input.guild.members.cache.get(target.id);
        
        const data = await getUserData(target.id);

        const balEmbed = new EmbedBuilder()
            .setTitle(`👛 Cartera de ${targetMember.displayName}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/f3/9c/68/f39c680a689d0445f1b672727a69b7b7.gif') // Monedero cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `✨ **Efectivo:** \`${data.wallet.toLocaleString()} 🌸\`\n` +
                `🏛️ **Banco:** \`${data.bank.toLocaleString()} 🌸\`\n\n` +
                `💰 **Total:** \`${(data.wallet + data.bank).toLocaleString()} 🌸\`\n\n` +
                `*¡Sigue trabajando para ser una Rockstar!* 🎀\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setTimestamp()
            .setFooter({ 
                text: `Consultado por: ${input.member.displayName}`, 
                iconURL: (input.user ? input.user.displayAvatarURL() : input.author.displayAvatarURL()) 
            });

        return input.reply({ embeds: [balEmbed] });
    }
};