const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'mine',
    data: new SlashCommandBuilder().setName('mine').setDescription('⛏️ Minería Rockstar'),
    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);

        if (data.health <= 0) return input.reply("💀 **Estás agotada.** Necesitas descansar o comprar vidas.");

        // --- ⚙️ CONFIGURACIÓN ---
        let cooldown = 300000; 
        let riesgo = 0.15;
        let vidasP = 2;
        let boost = 1;

        if (data.premiumType === 'mensual') { 
            cooldown = 120000; riesgo = 0.10; boost = 1.5; 
        } else if (data.premiumType === 'bimestral') { 
            cooldown = 0; riesgo = 0.05; boost = 2; 
        }

        if (cooldown > 0 && Date.now() - (data.lastMine || 0) < cooldown) return input.reply("⏳ Espera un poco, reina.");

        // --- 💥 DERRUMBE ---
        if (Math.random() < riesgo) {
            data.health -= vidasP;
            await updateUserData(user.id, { health: Math.max(0, data.health), lastMine: Date.now() });
            return input.reply({ embeds: [new EmbedBuilder().setTitle('💥 ¡Derrumbe!').setColor('#FF0000').setDescription(`Perdiste ${vidasP} vidas.`)] });
        }

        // --- ✨ RECOMPENSAS (Dinero + Materiales) ---
        let ganaFlores = Math.floor(Math.random() * 500 + 600) * boost;
        let materiales = [];
        
        if (!data.inventory) data.inventory = {};

        // 🪵 Probabilidad de Madera (Wood)
        if (Math.random() < 0.50) { 
            const cant = Math.floor(Math.random() * 3) + 1;
            data.inventory['wood'] = (data.inventory['wood'] || 0) + cant;
            materiales.push(`\`${cant}x Wood 🪵\``);
        }

        // 🪨 Probabilidad de Piedra (Stone)
        if (Math.random() < 0.60) {
            const cant = Math.floor(Math.random() * 3) + 1;
            data.inventory['stone'] = (data.inventory['stone'] || 0) + cant;
            materiales.push(`\`${cant}x Stone 🪨\``);
        }

        // ⛓️ Probabilidad de Hierro (Iron Ore)
        if (Math.random() < 0.25) {
            const cant = Math.floor(Math.random() * 2) + 1;
            data.inventory['iron_ore'] = (data.inventory['iron_ore'] || 0) + cant;
            materiales.push(`\`${cant}x Iron Ore ⛓️\``);
        }

        await updateUserData(user.id, {
            wallet: (data.wallet || 0) + ganaFlores,
            inventory: data.inventory,
            lastMine: Date.now()
        });

        const embed = new EmbedBuilder()
            .setTitle('⛏️ Minería Exitosa')
            .setColor('#B5EAD7')
            .setDescription(
                `Ganaste **${ganaFlores}** flores.\n` +
                `📦 **Materiales:** ${materiales.length > 0 ? materiales.join(', ') : 'Solo polvo...'}\n\n` +
                `❤️ **Vidas:** ${data.health.toFixed(1)}`
            );

        return input.reply({ embeds: [embed] });
    }
};