const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🏦';
};

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
        const guild = input.guild;
        const member = input.member || { displayName: user.username };
        const e = () => getRndEmoji(guild);

        // --- 🛠️ MANEJO DE ARGUMENTOS ---
        const args = !isSlash ? input.content.split(/ +/).slice(1) : null;
        let amountStr = isSlash ? input.options.getString('cantidad') : args?.[0];

        if (!amountStr) return input.reply(`╰┈➤ ${e()} **Uso:** \`!!dep <cantidad | all>\``);

        let data = await getUserData(user.id);
        const walletActual = data.wallet || 0;

        let amount;
        if (amountStr.toLowerCase() === 'all' || amountStr.toLowerCase() === 'todo') {
            amount = walletActual;
        } else {
            amount = parseInt(amountStr);
        }

        // --- 🛡️ VALIDACIONES ---
        if (isNaN(amount) || amount <= 0) return input.reply(`╰┈➤ ❌ ${e()} Indica una cantidad válida para depositar.`);
        if (amount > walletActual) return input.reply(`╰┈➤ ❌ ${e()} No tienes tantas flores en tu cartera.`);

        // --- 💸 PROCESO ---
        data.wallet -= amount;
        data.bank = (data.bank || 0) + amount;
        await updateUserData(user.id, data);

        const depEmbed = new EmbedBuilder()
            .setTitle(`${e()} DEPÓSITO EN BÓVEDA ${e()}`)
            .setColor('#1a1a1a')
            // GIF de caja fuerte o seguridad premium
            .setThumbnail('https://i.pinimg.com/originals/90/16/e0/9016e00311f67f519541a7d1897b7193.gif') 
            .setDescription(
                `> *“Tus bienes han sido transferidos a la caja fuerte de Rockstar.”*\n\n` +
                `**─── ✦ TRANSACCIÓN ✦ ───**\n` +
                `${e()} **Depositado:** \`${amount.toLocaleString()} 🌸\`\n` +
                `${e()} **Bóveda:** \`${data.bank.toLocaleString()} 🌸\`\n` +
                `**───────────────────**\n\n` +
                `╰┈➤ *Efectivo restante:* \`${data.wallet.toLocaleString()} 🌸\``
            )
            .setTimestamp()
            .setFooter({ text: `Rockstar Security • ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [depEmbed] });
    }
};
