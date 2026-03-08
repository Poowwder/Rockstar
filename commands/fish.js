const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

const zones = {
    "lago": { name: "🌸 Lago Cristal", fish: ["🐟", "🐠"], min: 50, max: 150, premium: false, boss: { name: "Rey Rana", chance: 10, reward: 1000 } },
    "oceano": { name: "⚓ Océano VIP", fish: ["🦈", "🐳"], min: 500, max: 2000, premium: true, boss: { name: "Kraken", chance: 15, reward: 5000 } }
};

module.exports = {
    name: 'fish',
    category: 'economía',
    async execute(message, args) {
        let data = await getUserData(message.author.id);
        const zoneKey = args[0]?.toLowerCase();

        if (!zoneKey || !zones[zoneKey]) return message.reply("Usa: `!!fish lago` u `!!fish oceano` (VIP)");
        const zone = zones[zoneKey];

        if (zone.premium && data.premiumType === 'none') return message.reply("🔒 Zona VIP");

        if (Math.random() * 100 <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(message.author.id, data);
            return message.reply(`🔱 ¡DERROTASTE AL ${zone.boss.name.toUpperCase()}! Ganaste **${zone.boss.reward}** flores.`);
        }

        const win = Math.floor(Math.random() * (zone.max - zone.min)) + zone.min;
        data.wallet += win;
        await updateUserData(message.author.id, data);
        message.reply(`🎣 Pescaste un ${zone.fish[0]} y ganaste **${win}** flores.`);
    }
};