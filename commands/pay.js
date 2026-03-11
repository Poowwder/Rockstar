const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🌸';
};

module.exports = {
    name: 'pay',
    aliases: ['pago', 'transferir', 'dar'],
    description: '💸 Envía flores a otro usuario',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('💸 Envía flores a otro usuario')
        .addUserOption(o => o.setName('usuario').setDescription('¿A quién le das flores?').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a enviar').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);
        
        // --- 🎯 OBTENER TARGET Y CANTIDAD ---
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        let amount = isSlash ? input.options.getInteger('cantidad') : parseInt(args?.[1]);

        // --- 🛡️ VALIDACIONES ---
        if (!target || target.id === author.id || target.bot) {
            return input.reply(`╰┈➤ ❌ ${e()} **Acción inválida.** No puedes transferir fondos a bots ni a ti mismo.`);
        }
        if (!amount || amount <= 0 || isNaN(amount)) {
            return input.reply(`╰┈➤ ❌ ${e()} **Cantidad no válida.** Indica un monto real.`);
        }

        // --- 💰 LÓGICA DE TRANSACCIÓN ---
        const senderData = await getUserData(author.id);
        const walletActual = senderData.wallet || 0;

        if (walletActual < amount) {
            return input.reply(`╰┈➤ 💸 ${e()} **Fondos insuficientes.** No tienes suficientes flores en tu cartera.`);
        }

        const targetData = await getUserData(target.id);

        // Actualización de balances
        senderData.wallet = walletActual - amount;
        targetData.wallet = (targetData.wallet || 0) + amount;

        // Guardamos ambos en la DB
        await updateUserData(author.id, senderData);
        await updateUserData(target.id, targetData);

        // --- 🖼️ EMBED ROCKSTAR ---
        const targetMember = guild.members.cache.get(target.id) || { displayName: target.username };
        const authorMember = guild.members.cache.get(author.id) || { displayName: author.username };

        const embed = new EmbedBuilder()
            .setTitle(`${e()} TRANSFERENCIA EXITOSA ${e()}`)
            .setColor('#1a1a1a')
            // GIF de intercambio de dinero o maletín
            .setThumbnail('https://i.pinimg.com/originals/7e/8a/0a/7e8a0a95e0c8b6727284f67d4f9d9804.gif') 
            .setDescription(
                `> *“Un trato entre sombras ha sido sellado.”*\n\n` +
                `**─── ✦ DETALLES ✦ ───**\n` +
                `${e()} **Remitente:** \`${authorMember.displayName}\`\n` +
                `${e()} **Destinatario:** \`${targetMember.displayName}\`\n` +
                `${e()} **Monto:** \`${amount.toLocaleString()} 🌸\`\n` +
                `**───────────────────**\n\n` +
                `╰┈➤ *Balance restante:* \`${senderData.wallet.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Rockstar Economy • Tracción segura`, iconURL: author.displayAvatarURL() })
            .setTimestamp();

        return input.reply({ embeds: [embed] });
    }
};
