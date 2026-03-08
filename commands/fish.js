const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

// --- DATOS INTEGRADOS (Para evitar errores de lectura de archivos) ---
const zones = {
  "charco": {
    "name": "⛲ Fuente del Deseo",
    "fish": ["🐟 Pez Pequeño", "🌱 Alga Marina", "👟 Bota Vieja"],
    "min_reward": 10, "max_reward": 50, "emoji": "⛲", "premium": false,
    "boss": { "name": "🐸 Rey Rana", "chance": 10, "reward": 500 }
  },
  "lago": {
    "name": "🌸 Lago de Cristal",
    "fish": ["🐠 Pez Tropical", "🐡 Pez Globo Cute", "🦐 Camaroncito"],
    "min_reward": 60, "max_reward": 150, "emoji": "🌸", "premium": false,
    "boss": { "name": "🦢 Cisne de Jade", "chance": 10, "reward": 1500 }
  },
  "oceano": {
    "name": "⚓ Océano Profundo",
    "fish": ["🦈 Tiburón Bebé", "🐙 Pulpito Rosa", "🐳 Ballena Mini"],
    "min_reward": 350, "max_reward": 700, "emoji": "⚓", "premium": false,
    "boss": { "name": "🦑 Kraken Bebé", "chance": 12, "reward": 4000 }
  },
  "secreta": {
    "name": "🌌 Dimensión Galaxia (VIP)",
    "fish": ["⭐ Pez Estelar", "🛸 Disco Volador", "🌙 Fragmento de Luna", "👑 Tesoro Cósmico"],
    "min_reward": 2000, "max_reward": 4500, "emoji": "🌌", "premium": true,
    "boss": { "name": "🔱 Leviatán Astral", "chance": 15, "reward": 15000 }
  }
};

module.exports = {
    name: 'fish',
    aliases: ['pescar', 'p'],
    async execute(message, args) {
        const userId = message.author.id;
        let data = await getUserData(userId);

        if (!data) return message.reply("❌ Error al conectar con tu perfil.");

        const chosenZoneKey = args[0]?.toLowerCase();
        
        // 1. Mostrar Menú
        if (!chosenZoneKey || !zones[chosenZoneKey]) {
            let menu = "";
            for (const key in zones) {
                menu += `**${zones[key].emoji} ${key.toUpperCase()}** - ${zones[key].name}${zones[key].premium ? " [⭐ VIP]" : ""}\n`;
            }
            
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("🎣 ¿Dónde quieres pescar?")
                    .setDescription(`Usa \`!!fish [zona]\` para comenzar.\n\n${menu}`)
                    .setColor("#FFB6C1")
                    .setThumbnail('https://i.pinimg.com/originals/a1/39/33/a139333918f0f00f0732e92c3008889b.gif')]
            });
        }

        const zone = zones[chosenZoneKey];

        // 2. Verificación Premium
        if (zone.premium && data.premiumType === 'none') {
            return message.reply("🔒 ¡Esta zona es solo para **Miembros Premium**! ✨");
        }

        // 3. Lógica de Jefe
        const bossRoll = Math.random() * 100;
        if (bossRoll <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(userId, data);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`🔱 ¡JEFE APARECIDO: ${zone.boss.name.toUpperCase()}!`)
                    .setDescription(`¡Lo derrotaste y encontraste **${zone.boss.reward.toLocaleString()}** flores! 🌸`)
                    .setThumbnail('https://i.pinimg.com/originals/0f/b1/70/0fb17019192ba8cf37119da45046059c.gif')
                    .setColor("#00fbff")]
            });
        }

        // 4. Pesca Normal
        const pez = zone.fish[Math.floor(Math.random() * zone.fish.length)];
        const ganancia = Math.floor(Math.random() * (zone.max_reward - zone.min_reward + 1)) + zone.min_reward;

        data.wallet += ganancia;
        await updateUserData(userId, data);

        message.reply({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: `🎣 Pesca en ${zone.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`¡Atrapaste un **${pez}**!\n✨ Ganaste **${ganancia.toLocaleString()}** flores.`)
                .setColor(zone.premium ? "#E1ADFF" : "#FFB6C1")
                .setFooter({ text: `Cartera: ${data.wallet.toLocaleString()} flores` })]
        });
    }
};