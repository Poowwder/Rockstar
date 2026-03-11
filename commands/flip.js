const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getE = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🌸';
};

module.exports = {
    name: 'flip',
    description: '🪙 Apuesta tus flores a cara o cruz',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('🪙 Apuesta tus flores a cara o cruz')
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a apostar').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getE(guild);

        // --- 🛠️ MANEJO DE ARGUMENTOS ---
        const amount = isSlash ? input.options.getInteger('cantidad') : parseInt(input.content.split(/ +/)[1]);

        let data = await getUserData(user.id);
        const walletActual = data.wallet || 0;

        // --- 🛡️ VALIDACIONES ---
        if (!amount || isNaN(amount) || amount <= 0) {
            return input.reply(`╰┈➤ ❌ ${e()} Indica una cantidad válida para apostar.`);
        }
        if (amount > walletActual) {
            return input.reply(`╰┈➤ ❌ ${e()} No tienes suficientes flores en tu cartera.`);
        }

        // Límite de apuesta (Premium tienen más libertad)
        const maxBet = (data.premiumType === 'pro' || data.premiumType === 'ultra') ? 50000 : 10000;
        if (amount > maxBet) {
            return input.reply(`╰┈➤ ❌ ${e()} La apuesta máxima permitida es de \`${maxBet.toLocaleString()} 🌸\`.`);
        }

        // --- 🎲 LÓGICA DE JUEGO ---
        const win = Math.random() > 0.52; // 52% de probabilidad para la casa (estilo Hardcore)
        
        if (win) {
            data.wallet += amount;
        } else {
            data.wallet -= amount;
        }
        
        await updateUserData(user.id, data);

        // --- 🖼️ EMBED ROCKSTAR ---
        const flipEmbed = new EmbedBuilder()
            .setTitle(win ? `${e()} ¡TRATO CERRADO! ${e()}` : `${e()} MALA SUERTE ${e()}`)
            .setColor(win ? '#2ecc71' : '#1a1a1a') // Verde éxito o Negro Rockstar
            .setThumbnail(win 
                ? 'https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif' // Moneda de éxito
                : 'https://i.pinimg.com/originals/f3/f5/63/f3f56363a0336215707a276856037e81.gif' // Fracaso
            )
            .setDescription(
                `> *“La moneda giró en las sombras y el destino decidió por ti.”*\n\n` +
                `**─── ✦ RESULTADO ✦ ───**\n` +
                `${e()} **Apostaste:** \`${amount.toLocaleString()} 🌸\`\n` +
                `${e()} **Resultado:** ${win ? `\`+${amount.toLocaleString()} 🌸\`` : `\`-${amount.toLocaleString()} 🌸\``}\n` +
                `**───────────────────**\n\n` +
                `╰┈➤ **Tu Cartera:** \`${data.wallet.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Rockstar Casino • Arriésgalo todo`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        return input.reply({ embeds: [flipEmbed] });
    }
};
