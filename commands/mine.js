const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

const mineZones = {
    "túnel": {
        name: "🕳️ Túnel de Tierra",
        items: ["🪨 Piedra", "🫘 Carbón", "🔩 Hierro"],
        min: 30, max: 100, premium: false,
        boss: { name: "Rata de Cueva", chance: 8, reward: 600 }
    },
    "cristal": {
        name: "💎 Cueva de Cristal (VIP)",
        items: ["💎 Diamante", "💜 Amatista", "✨ Prisma"],
        min: 800, max: 3000, premium: true,
        boss: { name: "Gólem de Cuarzo", chance: 12, reward: 8000 }
    }
};

module.exports = {
    name: 'mine',
    category: 'economía',
    aliases: ['minar', 'm'],
    async execute(message, args) {
        let data = await getUserData(message.author.id);
        const zoneKey = args[0]?.toLowerCase();

        if (!zoneKey || !mineZones[zoneKey]) {
            return message.reply("⛏️ Elige una zona: `!!mine túnel` o `!!mine cristal` (VIP)");
        }

        const zone = mineZones[zoneKey];
        if (zone.premium && data.premiumType === 'none') return message.reply("🔒 Esta zona requiere **Premium**.");

        // Lógica de Jefe
        if (Math.random() * 100 <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(message.author.id, data);
            return message.reply(`⚔️ ¡Apareció un **${zone.boss.name}**! Lo derrotaste y obtuviste **${zone.boss.reward}** flores.`);
        }

        const item = zone.items[Math.floor(Math.random() * zone.items.length)];
        const ganancia = Math.floor(Math.random() * (zone.max - zone.min)) + zone.min;
        
        data.wallet += ganancia;
        await updateUserData(message.author.id, data);

        message.reply(`⛏️ Picaste **${item}** en el ${zone.name} y ganaste **${ganancia}** flores.`);
    }
};