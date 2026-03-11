const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 
const fs = require('fs');
const path = require('path');

// ⏳ Tiempos
const COOLDOWN_MS = 86400000;
const GRACE_PERIOD_MS = 172800000; 

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

// --- 🎁 POOL DE OBJETOS HARDCORE ---
const ITEM_POOL = [
    { id: 'wood', name: 'Madera 🪵', weight: 6000, min: 5, max: 15 },
    { id: 'stone', name: 'Piedra 🪨', weight: 6000, min: 5, max: 15 },
    { id: 'common_fish', name: 'Pescado Común 🐟', weight: 3000, min: 2, max: 5 },
    { id: 'iron_ore', name: 'Mena de Hierro ⛓️', weight: 1500, min: 1, max: 4 },
    { id: 'diamante_rosa', name: 'Diamante Rosa ✨', weight: 200, min: 1, max: 1 },
    { id: 'pico_hierro', name: 'Rompealmas de Acero ⛏️', weight: 30, min: 1, max: 1 },
    { id: 'cana_reforzada', name: 'Garra de Río 🎣', weight: 30, min: 1, max: 1 },
    { id: 'pico_diamante', name: 'Perforador Celestial ⛏️', weight: 10, min: 1, max: 1 },
    { id: 'cana_legendaria', name: 'Atrapasueños Marino 🎣', weight: 10, min: 1, max: 1 },
    { id: 'pico_mitico', name: 'Eclipse Eterno ⛏️', weight: 2, min: 1, max: 1 },
    { id: 'cana_divina', name: 'Lágrima de Neptuno 🎣', weight: 2, min: 1, max: 1 },
    { id: 'pico_void', name: 'Pico Void Haven 🌌', weight: 1, min: 1, max: 1 },
    { id: 'cana_void', name: 'Caña Abyss of Stars 🌌', weight: 1, min: 1, max: 1 }
];

module.exports = {
    name: 'daily',
    description: '🎁 Recibe tu ofrenda diaria de las sombras.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('🎁 Recibe tu ofrenda diaria (Dinero, Materiales y Reliquias).'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);
        
        let data = await getUserData(user.id);
        const now = Date.now();
        const lastClaim = data.lastDaily ? new Date(data.lastDaily).getTime() : 0;
        const timePassed = now - lastClaim;

        if (timePassed < COOLDOWN_MS) {
            const timeLeftMS = COOLDOWN_MS - timePassed;
            const hours = Math.floor(timeLeftMS / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMS % (1000 * 60 * 60)) / (1000 * 60));
            return input.reply({ embeds: [new EmbedBuilder().setTitle(`${e()} CICLO INCOMPLETO ${e()}`).setColor('#1a1a1a').setThumbnail('https://i.pinimg.com/originals/91/9a/84/919a8421c970477e6f987c805a9603e8.gif').setDescription(`> *“El abismo requiere paciencia, mortal.”*\n\n╰┈➤ Regresa cuando el ciclo se reinicie en **${hours}h ${minutes}m**.`)] });
        }

        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
       // Dentro de work.js, crime.js y daily.js
const activePath = path.join(__dirname, '../data/activeEvent.json');
let multiEvento = 1;

if (fs.existsSync(activePath)) {
    const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    // Estos comandos solo dan bonus si el evento es de dinero.
    if (ev.type === 'money') multiEvento = ev.multiplier;
}

        let streak = data.dailyStreak || 0;
        let streakPerdida = false;
        if (timePassed > GRACE_PERIOD_MS && lastClaim !== 0) { streak = 1; streakPerdida = true; } else { streak += 1; }

        const isWeeklyBonus = (streak % 7 === 0);
        let premium = (data.premiumType || 'none').toLowerCase();

        // --- 💎 BONO POR RANGO PREMIUM (Dinero: 3%, 7%, 10%) ---
        let bonoMoney = 1.03; 
        let minMoney = 2000, maxMoney = 3000, boxPulls = 1, boostChance = 0.10, rangoNombre = 'Usuario Normal';

        if (premium === 'pro' || premium === 'mensual') { 
            minMoney = 4000; maxMoney = 6000; boxPulls = 2; boostChance = 0.35; bonoMoney = 1.07; rangoNombre = 'Premium Pro'; 
        } 
        else if (premium === 'ultra' || premium === 'bimestral') { 
            minMoney = 7000; maxMoney = 10000; boxPulls = 3; boostChance = 0.70; bonoMoney = 1.10; rangoNombre = 'Premium Ultra'; 
        }

        let weeklyMessage = "";
        if (isWeeklyBonus) {
            minMoney = Math.floor(minMoney * 1.5); maxMoney = Math.floor(maxMoney * 1.5);
            if (rangoNombre === 'Usuario Normal') boxPulls = 2;
            else if (rangoNombre === 'Premium Pro') boxPulls = 4;
            else if (rangoNombre === 'Premium Ultra') boxPulls = 6;
            weeklyMessage = `\n> 🎊 **¡BONIFICACIÓN SEMANAL!** Has sido bendecido con botín extra.\n`;
        }

        // --- 💰 CÁLCULO FINAL DE DINERO (Base * Evento * Bono Rango) ---
        const baseMoney = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
        const moneyReward = Math.floor((baseMoney * multiEvento) * bonoMoney);
        data.wallet = (data.wallet || 0) + moneyReward;

        // --- 🎁 APERTURA DE LA CAJA ---
        if (!data.inventory) data.inventory = {};
        const totalWeight = ITEM_POOL.reduce((sum, item) => sum + item.weight, 0);
        let lootReport = [];
        let aggregatedLoot = {};

        for (let i = 0; i < boxPulls; i++) {
            let random = Math.random() * totalWeight;
            let current = 0;
            for (const item of ITEM_POOL) {
                current += item.weight;
                if (random < current) {
                    const cant = Math.floor(Math.random() * (item.max - item.min + 1) + item.min);
                    aggregatedLoot[item.id] = { name: item.name, amount: (aggregatedLoot[item.id]?.amount || 0) + cant };
                    break;
                }
            }
        }

        for (const id in aggregatedLoot) {
            data.inventory[id] = (data.inventory[id] || 0) + aggregatedLoot[id].amount;
            if (id.includes('pico') || id.includes('cana')) {
                lootReport.push(`🏆 **¡RELIQUIA!** \`x${aggregatedLoot[id].amount}\` ${aggregatedLoot[id].name}`);
            } else {
                lootReport.push(`📦 **Suministros:** \`x${aggregatedLoot[id].amount}\` ${aggregatedLoot[id].name}`);
            }
        }

        if (Math.random() < boostChance) {
            data.inventory['boost_flores'] = (data.inventory['boost_flores'] || 0) + 1;
            lootReport.push(`🚀 **Objeto Raro:** \`x1\` Multiplicador de Flores (Boost)`);
        }

        data.lastDaily = now;
        data.dailyStreak = streak;
        await updateUserData(user.id, data);

        const successEmbed = new EmbedBuilder()
            .setTitle(`${e()} OFRENDA DIARIA ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/44/1a/1a/441a1a5b8a071d7981504107b31e13e8.gif')
            .setDescription(
                `> ✨ *Las sombras reconocen tu lealtad.*\n` +
                `> 👑 **Rango:** \`${rangoNombre}\` (\`+${((bonoMoney-1)*100).toFixed(0)}%\`)\n` +
                `> 🔥 **Racha:** \`${streak}\` días ${streakPerdida ? '(Reiniciada)' : ''}${weeklyMessage}\n\n` +
                `**─── ✦ TU RECOMPENSA ✦ ───**\n` +
                `🌸 **Flores:** \`+${moneyReward.toLocaleString()}\` flores\n` +
                `${lootReport.join('\n')}\n` +
                (multiEvento > 1 ? `✨ **Evento Activo:** \`x${multiEvento}\` aplicado\n` : "") +
                `**────────────────────**\n` +
                `🏦 **Cartera:** \`${data.wallet.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Daily ⊹ Rockstar Nightfall` });

        return input.reply({ embeds: [successEmbed] });
    }
};
