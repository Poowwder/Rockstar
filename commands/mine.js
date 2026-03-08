const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

// Datos integrados para evitar errores de carga
const mineZones = {
  "tunel": {
    "name": "🕳️ Túnel de Tierra",
    "items": ["🪨 Piedra", "🫘 Carbón", "🔩 Hierro"],
    "min_reward": 20, "max_reward": 80, "emoji": "🕳️", "premium": false,
    "boss": { "name": "🐀 Topo Gigante", "chance": 10, "reward": 800 }
  },
  "cristal": {
    "name": "💎 Cueva de Cristales",
    "items": ["💎 Cuarzo", "💜 Amatista", "💙 Zafiro"],
    "min_reward": 150, "max_reward": 400, "emoji": "💎", "premium": false,
    "boss": { "name": "💎 Gólem de Cristal", "chance": 12, "reward": 2500 }
  },
  "prismas": {
    "name": "🌈 Cueva de Prismas (VIP)",
    "items": ["✨ Diamante Puro", "🎇 Fragmento Estelar", "🔱 Reliquia Antigua"],
    "min_reward": 2500, "max_reward": 5000, "emoji": "🌈", "premium": true,
    "boss": { "name": "🐲 Dragón de Diamante", "chance": 15, "reward": 20000 }
  }
};

module.exports = {
    name: 'mine',
    aliases: ['minar', 'm'],
    async execute(message, args) {
        const userId = message.author.id;
        let data = await getUserData(userId);
        const chosenKey = args[0]?.toLowerCase();

        if (!chosenKey || !mineZones[chosenKey]) {
            let menu = Object.keys(mineZones).map(k => `**${mineZones[k].emoji} ${k.toUpperCase()}** - ${mineZones[k].name}${mineZones[k].premium ? " [⭐ VIP]" : ""}`).join("\n");
            return message.reply({ 
                embeds: [new EmbedBuilder()
                    .setTitle("⛏️ ¿A dónde irás a minar?")
                    .setDescription(`Escribe \`!!mine [zona]\` para empezar.\n\n${menu}`)
                    .setColor("#FFB6C1")
                    .setThumbnail('https://i.pinimg.com/originals/47/34/00/47340078869c9780074215f769493f0b.gif')] 
            });
        }

        const zone = mineZones[chosenKey];
        if (zone.premium && data.premiumType === 'none') return message.reply("🔒 ¡Esta cueva es solo para **Miembros Premium**! ✨");

        // Lógica de JEFE
        if ((Math.random() * 100) <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(userId, data);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`⚔️ ¡JEFE APARECIDO: ${zone.boss.name}!`)
                    .setDescription(`¡Lo derrotaste y saqueaste **${zone.boss.reward.toLocaleString()}** flores! 🌸`)
                    .setThumbnail('https://i.pinimg.com/originals/91/91/36/91913612d35272a0833215f9392e22f2.gif')
                    .setColor("#FF0000")]
            });
        }

        // Lógica Normal
        const item = zone.items[Math.floor(Math.random() * zone.items.length)];
        const ganancia = Math.floor(Math.random() * (zone.max_reward - zone.min_reward + 1)) + zone.min_reward;
        data.wallet += ganancia;
        await updateUserData(userId, data);

        message.reply({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: `⛏️ Minando en ${zone.name}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`¡Picaste un **${item}** y ganaste **${ganancia.toLocaleString()}** flores! ✨`)
                .setThumbnail('https://i.pinimg.com/originals/47/34/00/47340078869c9780074215f769493f0b.gif')
                .setColor(zone.premium ? "#E1ADFF" : "#FFB6C1")
                .setFooter({ text: `Cartera: ${data.wallet.toLocaleString()} flores` })]
        });
    }
};