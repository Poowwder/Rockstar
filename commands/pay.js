const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'pay',
    aliases: ['pago', 'transferir', 'dar'],
    description: '💸 Envía flores a otro usuario',
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('💸 Envía flores a otro usuario')
        .addUserOption(o => o.setName('usuario').setDescription('¿A quién le das flores?').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a enviar').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        
        // --- 🎯 OBTENER TARGET Y CANTIDAD (Compatibilidad Total) ---
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        let amount;
        
        if (isSlash) {
            amount = input.options.getInteger('cantidad');
        } else {
            // Si es !!pay @user 500 -> args[1] es el monto
            amount = parseInt(args[1]);
        }

        // --- 🛡️ VALIDACIONES ---
        if (!target || target.id === author.id || target.bot) {
            return input.reply(`${emojis.exclamation || '⚠️'} **¡Acción inválida, linda!** No puedes enviarte flores a ti misma ni a bots.`);
        }
        if (!amount || amount <= 0 || isNaN(amount)) {
            return input.reply(`${emojis.exclamation || '⚠️'} **Indica una cantidad válida**, reina.`);
        }

        // --- 💰 LÓGICA DE TRANSACCIÓN ---
        const senderData = await getUserData(author.id);
        const walletActual = senderData.wallet || 0;

        if (walletActual < amount) {
            return input.reply(`${emojis.exclamation || '⚠️'} **No tienes suficientes flores** en tu cartera. ¡A trabajar! ✨`);
        }

        const targetData = await getUserData(target.id);

        // Aplicamos los cambios en los objetos
        const nuevaWalletSender = walletActual - amount;
        const nuevaWalletTarget = (targetData.wallet || 0) + amount;

        // Guardamos en MongoDB
        await updateUserData(author.id, { wallet: nuevaWalletSender });
        await updateUserData(target.id, { wallet: nuevaWalletTarget });

        // --- 🖼️ EMBED ESTÉTICO ---
        const targetMember = input.guild.members.cache.get(target.id) || { displayName: target.username };
        const authorName = isSlash ? input.member.displayName : input.member.displayName;

        const embed = new EmbedBuilder()
            .setTitle(`${emojis.pinkstars || '✨'} Transferencia Exitosa ${emojis.pinkstars || '✨'}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/4d/30/1e/4d301e523315f013346e9198305c5678.gif')
            .setDescription(
                `**${authorName}** le envió \`${amount}\` ${emojis.heart || '🌸'}\n` +
                `a **${targetMember.displayName}**.\n\n` +
                `*¡Qué generosa eres!* ${emojis.pinkbow || '🎀'}`
            )
            .setFooter({ text: 'Rockstar Economy ✨' })
            .setTimestamp();

        return input.reply({ embeds: [embed] });
    }
};