const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🏦';
};

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
        const guild = input.guild;
        const member = input.member || { displayName: user.username };
        const e = () => getRndEmoji(guild);

        // --- 🛠️ MANEJO DE ARGUMENTOS ---
        const args = !isSlash ? input.content.split(/ +/).slice(1) : null;
        let amountStr = isSlash ? input.options.getString('cantidad') : args?.[0];

        if (!amountStr) return input.reply(`╰┈➤ ${e()} **Uso:** \`!!with <cantidad | all>\``);

        let data = await getUserData(user.id);
        const bancoActual = data.bank || 0;

        if (amountStr.toLowerCase() === 'all') {
            amountStr = bancoActual.toString();
        }

        const amount = parseInt(amountStr);

        // --- 🛡️ VALIDACIONES ---
        if (isNaN(amount) || amount <= 0) return input.reply(`╰┈➤ ❌ ${e()} Indica una cantidad válida para retirar.`);
        if (amount > bancoActual) return input.reply(`╰┈➤ ❌ ${e()} No tienes suficientes fondos en la bóveda.`);

        // --- 💸 PROCESO ---
        data.bank -= amount;
        data.wallet = (data.wallet || 0) + amount;
        await updateUserData(user.id, data);

        const withEmbed = new EmbedBuilder()
            .setTitle(`${e()} RETIRO DE BÓVEDA ${e()}`)
            .setColor('#1a1a1a')
            // GIF de dinero/banco con estilo oscuro
            .setThumbnail('https://i.pinimg.com/originals/a4/09/20/a40920d321074e508a8d132b49d63c5d.gif') 
            .setDescription(
                `> *“Tus flores han sido liberadas de la seguridad del banco.”*\n\n` +
                `**─── ✦ TRANSACCIÓN ✦ ───**\n` +
                `${e()} **Retirado:** \`${amount.toLocaleString()} 🌸\`\n` +
                `${e()} **En Mano:** \`${data.wallet.toLocaleString()} 🌸\`\n` +
                `**───────────────────**\n\n` +
                `╰┈➤ *Balance en bóveda:* \`${data.bank.toLocaleString()} 🌸\``
            )
            .setTimestamp()
            .setFooter({ text: `Rockstar Banking • ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [withEmbed] });
    }
};
