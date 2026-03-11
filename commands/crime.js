const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'crime',
    description: '🕵️ Intenta un crimen para ganar flores.',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('🕵️ Comete un crimen bajo tu propio riesgo'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        let data = await getUserData(user.id);
        const premium = (data.premiumType || 'none').toLowerCase();

        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
        // Dentro de work.js, crime.js y daily.js
const activePath = path.join(__dirname, '../data/activeEvent.json');
let multiEvento = 1;

if (fs.existsSync(activePath)) {
    const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    // Estos comandos solo dan bonus si el evento es de dinero.
    if (ev.type === 'money') multiEvento = ev.multiplier;
}

        // --- 💎 BONO POR RANGO PREMIUM ---
        let bonoRango = 1.03; // Normal: 3%
        if (premium === 'pro') bonoRango = 1.07; // Pro: 7%
        if (premium === 'ultra') bonoRango = 1.10; // Ultra: 10%

        // --- 🎲 LÓGICA DE ÉXITO/FRACASO ---
        const exito = Math.random() > 0.50; // 50% de probabilidad

        if (!exito) {
            return input.reply({ content: `╰┈➤ 🚨 **¡Te atraparon!** No pudiste llevarte nada esta vez, reina. Ten más cuidado.` });
        }

        // --- 💰 CÁLCULO DE RECOMPENSA ---
        const base = Math.floor(Math.random() * 200) + 100;
        const finalReward = Math.floor((base * multiEvento) * bonoRango);

        data.wallet = (data.wallet || 0) + finalReward;
        await updateUserData(user.id, data);

        // --- 🖼️ EMBED ORIGINAL ---
        const embed = new EmbedBuilder()
            .setTitle('🕵️ ¡Golpe Maestro!')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/4d/30/1e/4d301e523315f013346e9198305c5678.gif')
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `**${member.displayName}**, el plan salió a la perfección.\n\n` +
                `╰┈➤ Conseguiste: **${finalReward.toLocaleString()} 🌸**\n` +
                `╰┈➤ En mano: \`${data.wallet.toLocaleString()} 🌸\`\n\n` +
                (multiEvento > 1 ? `✨ **¡Bonus de Evento x${multiEvento} aplicado!**\n` : "") +
                `*No dejes rastro de lo que hiciste...* ✨\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setFooter({ text: `Acción de: ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [embed] });
    }
};
