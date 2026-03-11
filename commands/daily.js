const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

// ⏳ Tiempos de ciclo
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
        let multiEvento = 1;
        const activePath = path.join(__dirname, '../data/activeEvent.json');
        if (fs.existsSync(activePath)) {
            try {
                const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
                if (ev.type === 'money') multiEvento = ev.multiplier;
            } catch (err) { console.log("Error leyendo evento:", err); }
        }

        let streak = data.dailyStreak || 0;
        let streakPerdida = false;
        if (timePassed > GRACE_PERIOD_MS && lastClaim !== 0) { streak = 1; streakPerdida = true; } else { streak += 1; }

        const isWeeklyBonus = (streak % 7 === 0);
        let premium = (data.premiumType || 'none').toLowerCase();
        
        // --- 💎 VAL
