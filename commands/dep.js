const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'dep',
    aliases: ['deposit', 'guardar'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('dep')
        .setDescription('🏛️ Guarda tus flores en el banco para protegerlas')
        .addStringOption(option => option.setName('cantidad').setDescription('Monto o "all"').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        const args = !isSlash ? input.content.split(/ +/).slice(1) : null;
        let amountStr = isSlash ? input.options.getString('cantidad') : args[0];

        let data = await getUserData(user.id);

        if (!amountStr) return input.reply("╰┈➤ 🌸 Indica cuánto quieres depositar o usa `all`.");

        let amount;
        if (amountStr.toLowerCase() === 'all') {
            amount = data.wallet;
        } else {
            amount = parseInt(amountStr);
        }

        if (isNaN(amount) || amount <= 0) return input.reply("╰┈➤ ❌ Esa no es una cantidad válida, linda.");
        if (amount > data.wallet) return input.reply("╰┈➤ ❌ No tienes tantas flores en tu monedero.");

        data.wallet -= amount;
        data.bank += amount;
        await updateUserData(user.id, data);

        const depEmbed = new EmbedBuilder()
            .setTitle('🏛️ Depósito Exitoso')
            .setColor('#B5EAD7') // Un verde pastel muy lindo
            .setThumbnail('https://i.pinimg.com/originals/90/16/e0/9016e00311f67f519541a7d1897b7193.gif') // Caja fuerte cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `**${member.displayName}**, tus flores están seguras.\n\n` +
                `╰┈➤ Depositaste: **${amount.toLocaleString()} 🌸**\n` +
                `╰┈➤ En mano: \`${data.wallet.toLocaleString()} 🌸\`\n\n` +
                `*Tu fortuna está creciendo... ¡qué emoción!* ✨\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setTimestamp()
            .setFooter({ text: `Acción de: ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [depEmbed] });
    }
};