const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'crime',
    description: '🕵️ Intenta un atraco en las calles de Rockstar.',
    data: new SlashCommandBuilder().setName('crime').setDescription('🕵️ Cometer un crimen'),

    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);
        const premium = (data.premiumType || 'none').toLowerCase();

        // --- 🌍 EVENTO GLOBAL ---
        let multiEvento = 1;
        const activePath = path.join(__dirname, '../data/activeEvent.json');
        if (fs.existsSync(activePath)) {
            const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
            if (ev.type === 'money') multiEvento = ev.multiplier;
        }

        // --- 💎 BONO POR RANGO ---
        let bonoRango = 1.03; 
        if (premium === 'pro') bonoRango = 1.07;
        if (premium === 'ultra') bonoRango = 1.10;

        // Probabilidad de éxito
        if (Math.random() < 0.40) return input.reply("🚨 **¡La policía te vio!** Tuviste que huir con las manos vacías.");

        const base = Math.floor(Math.random() * 150) + 80;
        const finalReward = Math.floor((base * multiEvento) * bonoRango);

        data.wallet = (data.wallet || 0) + finalReward;
        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setTitle('🕵️ GOLPE EXITOSO')
            .setColor('#1a1a1a')
            .setDescription(
                `> *“El plan salió a la perfección.”*\n\n` +
                `╰┈➤ **Botín:** \`${finalReward.toLocaleString()} 🌸\`\n` +
                `╰┈➤ **Tu Rango:** \`${premium.toUpperCase()}\` (\`+${((bonoRango-1)*100).toFixed(0)}%\`)`
            );

        return input.reply({ embeds: [embed] });
    }
};
