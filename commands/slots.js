const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- 🌑 EMOJIS AL AZAR DEL DOMINIO ---
const getRndEmoji = (guild) => {
    if (!guild) return '🌑';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🥃';
};

module.exports = {
    name: 'slots',
    description: 'Apuesta tus fondos en el casino de las sombras.',
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Apuesta tus fondos en el casino de las sombras.')
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Flores a apostar').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const guild = input.guild;
        const userId = author.id;
        const e = getRndEmoji(guild);

        // --- 🔢 OBTENER LA APUESTA (HÍBRIDO) ---
        let apuesta;
        if (isSlash) {
            apuesta = input.options.getInteger('cantidad');
        } else {
            apuesta = parseInt(args[0]);
            if (isNaN(apuesta) || apuesta <= 0) {
                return input.reply({ content: `╰┈➤ ❌ Las sombras exigen una cifra válida. Ejemplo: \`!!slots 100\`` });
            }
        }
        
        let data = await getUserData(userId);

        // --- 🛡️ VALIDACIONES ESTÉTICAS ---
        if (apuesta <= 0) return input.reply({ content: "╰┈➤ ❌ El abismo no acepta limosnas. Apuesta mínima: `1 🌸`.", ephemeral: true });
        if (data.wallet < apuesta) return input.reply({ content: `╰┈➤ ❌ Fondos insuficientes. Tus bolsillos solo contienen \`${data.wallet.toLocaleString()} 🌸\`.`, ephemeral: true });
        
        // Límite de apuesta (Premium tienen más límite)
        const limiteMax = (data.premiumType === 'pro' || data.premiumType === 'ultra') ? 50000 : 10000;
        if (apuesta > limiteMax) return input.reply({ content: `╰┈➤ ❌ La mesa tiene un límite de \`${limiteMax.toLocaleString()} 🌸\` para tu rango.`, ephemeral: true });

        // --- 🎰 MÁQUINA GIRANDO (Efecto Visual Nightfall) ---
        const embedGiro = new EmbedBuilder()
            .setTitle(`⊹ RULETA DE LAS SOMBRAS ⊹`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/80/f3/92/80f392231e342880783353272d54e565.gif')
            .setDescription(
                `> ┌───────────────┐\n` +
                `> │  ⟡  ┊  ⟡  ┊  ⟡  │\n` +
                `> └───────────────┘\n\n` +
                `-# *Los engranajes del destino están girando...*`
            );

        // Guardamos el mensaje para editarlo después
        const loadingMsg = await input.reply({ embeds: [embedGiro], fetchReply: true });

        // Tensión en el casino (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- ⚙️ LÓGICA DE PROBABILIDAD ---
        // Se mantienen los símbolos, pero presentados con más clase
        const simbolos = ['🍒', '🍒', '🍋', '🍋', '🍇', '🍇', '🔔', '🔔', '💎', '🌸'];
        const r1 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const r2 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const r3 = simbolos[Math.floor(Math.random() * simbolos.length)];

        const resultado = `${r1} ┊ ${r2} ┊ ${r3}`;
        let mult = 0;
        let win = false;

        // Premios
        if (r1 === r2 && r2 === r3) {
            win = true;
            if (r1 === '🌸') mult = 20; // Super Jackpot
            else if (r1 === '💎') mult = 10;
            else mult = 5;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            win = true;
            mult = 2;
        }

        // --- 💰 ACTUALIZACIÓN DE ECONOMÍA ---
        const total = apuesta * mult;
        if (win) {
            data.wallet += (total - apuesta);
        } else {
            data.wallet -= apuesta;
        }
        await updateUserData(userId, data);

        // --- 📄 EMBED FINAL ---
        const finalEmbed = new EmbedBuilder()
            .setTitle(`⊹ EL VEREDICTO ⊹`)
            .setColor('#1a1a1a') // Siempre negro, ganen o pierdan
            .setThumbnail(win ? 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif' : author.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `**Sujeto:** ${author.username}\n\n` +
                `> ┌───────────────┐\n` +
                `> │  ${resultado}  │\n` +
                `> └───────────────┘\n\n` +
                (win 
                    ? `╰┈➤ 🥃 **VICTORIA.** Las sombras te otorgan \`${total.toLocaleString()} 🌸\`.` 
                    : `╰┈➤ 🥀 **PERDICIÓN.** El abismo devoró tus \`${apuesta.toLocaleString()} 🌸\`.`
                )
            )
            .addFields(
                { name: `${e()} Patrimonio Restante`, value: `-# \`${data.wallet.toLocaleString()} 🌸\``, inline: true }
            )
            .setFooter({ text: 'El casino subterráneo nunca pierde... ⊹ Rockstar', iconURL: guild?.iconURL() });

        // Edición híbrida
        if (isSlash) {
            return input.editReply({ embeds: [finalEmbed] });
        } else {
            return loadingMsg.edit({ embeds: [finalEmbed] });
        }
    }
};
