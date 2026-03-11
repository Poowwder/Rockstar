const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '💎';
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('🎰 Apuesta tus flores en la máquina tragamonedas')
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Flores a apostar').setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const apuesta = interaction.options.getInteger('cantidad');
        const guild = interaction.guild;
        const e = () => getRndEmoji(guild);
        
        let data = await getUserData(userId);

        // --- 🛡️ VALIDACIONES ---
        if (apuesta <= 0) return interaction.reply({ content: "╰┈➤ ❌ La apuesta mínima es de `1 🌸`.", ephemeral: true });
        if (data.wallet < apuesta) return interaction.reply({ content: `╰┈➤ ❌ Fondos insuficientes. Tienes \`${data.wallet.toLocaleString()} 🌸\`.`, ephemeral: true });
        
        // Límite de apuesta (Premium tienen más límite)
        const limiteMax = (data.premiumType === 'pro' || data.premiumType === 'ultra') ? 50000 : 10000;
        if (apuesta > limiteMax) return interaction.reply({ content: `╰┈➤ ❌ La apuesta máxima es de \`${limiteMax.toLocaleString()} 🌸\`.`, ephemeral: true });

        // --- 🎰 MÁQUINA GIRANDO (Efecto Visual) ---
        const embedGiro = new EmbedBuilder()
            .setTitle(`${e()} GIRANDO... ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/80/f3/92/80f392231e342880783353272d54e565.gif')
            .setDescription(`> \`|———————|\`\n> \`| 🎰 | 🎰 | 🎰 |\`\n> \`|———————|\`\n\n*La suerte está echada...*`);

        await interaction.reply({ embeds: [embedGiro] });

        // Simulamos 2 segundos de tensión
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- ⚙️ LÓGICA DE PROBABILIDAD ---
        // Símbolos con pesos (🌸 es más raro que 🍒)
        const simbolos = ['🍒', '🍒', '🍋', '🍋', '🍇', '🍇', '🔔', '🔔', '💎', '🌸'];
        const r1 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const r2 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const r3 = simbolos[Math.floor(Math.random() * simbolos.length)];

        const resultado = `[ ${r1} | ${r2} | ${r3} ]`;
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
            .setTitle(`${e()} RESULTADO SLOTS ${e()}`)
            .setColor(win ? '#2ecc71' : '#1a1a1a')
            .setThumbnail(win ? 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif' : null)
            .setDescription(
                `**${interaction.user.username}** tiró de la palanca...\n\n` +
                `> \`|———————|\`\n` +
                `> \`| ${resultado} |\`\n` +
                `> \`|———————|\`\n\n` +
                (win ? `🎊 **¡GANASTE!** Recibes \`${total.toLocaleString()} 🌸\`` : `😔 Has perdido tus \`${apuesta.toLocaleString()} 🌸\``)
            )
            .addFields(
                { name: 'Balance Final', value: `\`${data.wallet.toLocaleString()} 🌸\``, inline: true }
            )
            .setFooter({ text: 'El casino siempre gana... o no. ⊹ Rockstar Casino' });

        return interaction.editReply({ embeds: [finalEmbed] });
    }
};
