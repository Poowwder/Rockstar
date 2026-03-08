const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'with',
    aliases: ['withdraw', 'retirar'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('with')
        .setDescription('🏛️ Saca flores de tu cuenta bancaria')
        .addStringOption(option => option.setName('cantidad').setDescription('Monto o "all"').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        const args = !isSlash ? input.content.split(/ +/).slice(1) : null;
        let amountStr = isSlash ? input.options.getString('cantidad') : args[0];

        let data = await getUserData(user.id);

        if (amountStr.toLowerCase() === 'all') {
            amountStr = data.bank.toString();
        }

        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) return input.reply("╰┈➤ ❌ Indica una cantidad válida para retirar, linda.");
        if (amount > data.bank) return input.reply("╰┈➤ ❌ No tienes tantas flores en el banco.");

        data.bank -= amount;
        data.wallet += amount;
        await updateUserData(user.id, data);

        const withEmbed = new EmbedBuilder()
            .setTitle('🏛️ Retiro Exitoso')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/7e/8a/0a/7e8a0a95e0c8b6727284f67d4f9d9804.gif') // Cajero cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `**${member.displayName}**, aquí tienes tus flores.\n\n` +
                `╰┈➤ Retiraste: **${amount.toLocaleString()} 🌸**\n` +
                `╰┈➤ En mano: \`${data.wallet.toLocaleString()} 🌸\`\n\n` +
                `*¡No las gastes todas en un solo lugar!* ✨\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setTimestamp()
            .setFooter({ text: `Acción de: ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [withEmbed] });
    }
};