const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'crime',
    description: 'Comete un crimen en las sombras.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Comete un acto ilícito bajo tu propio riesgo.'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '🌑';
        };

        let data = await getUserData(user.id);
        const premium = (data.premiumType || 'none').toLowerCase();

        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
        const activePath = path.join(__dirname, '../data/activeEvent.json');
        let multiEvento = 1;

        if (fs.existsSync(activePath)) {
            const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
            if (ev.type === 'money') multiEvento = ev.multiplier;
        }

        // --- 💎 BONO POR RANGO PREMIUM ---
        let bonoRango = 1.03; // Normal: 3%
        if (premium === 'pro') bonoRango = 1.07; // Pro: 7%
        if (premium === 'ultra') bonoRango = 1.10; // Ultra: 10%

        // --- 🎲 LÓGICA DE ÉXITO/FRACASO ---
        const exito = Math.random() > 0.50; // 50% de probabilidad

        if (!exito) {
            const failMsg = `╰┈➤ ${getE()} **Emboscada.** Las autoridades te acorralaron. Escapas con vida, pero con los bolsillos vacíos.`;
            return isSlash ? input.reply({ content: failMsg }) : input.reply(failMsg);
        }

        // --- 💰 CÁLCULO DE RECOMPENSA ---
        const base = Math.floor(Math.random() * 200) + 100;
        const finalReward = Math.floor((base * multiEvento) * bonoRango);

        data.wallet = (data.wallet || 0) + finalReward;
        await updateUserData(user.id, data);

        // --- 🖼️ EMBED DARK ROCKSTAR ---
        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ 
                name: `⊹ Operación Clandestina: ${user.username} ⊹`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(
                `${getE()} *“Las sombras ocultan tus huellas...”* ${getE()}\n\n` +
                `${getE()} **Botín asegurado:** \`${finalReward.toLocaleString()}\` Flores\n` +
                `${getE()} **Cartera actual:** \`${data.wallet.toLocaleString()}\` Flores\n` +
                (multiEvento > 1 ? `\n${getE()} *Bono global de evento (x${multiEvento}) activo.*` : "")
            )
            .setFooter({ text: `Rockstar ⊹ Nightfall` })
            .setTimestamp();

        return input.reply({ embeds: [embed] });
    }
};
