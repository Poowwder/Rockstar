const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../economyManager.js');

const ICONS = { mine: '⛏️', money: '🌸', boss: '💀', heart: '❤️', loot: '🎁' };

const BOSSES = {
    comun: { 
        name: 'Gólem de Piedra', hp: 120, dmg: 15, reward: 1500,
        rareLoot: { id: 'fragmento_piedra_antigua', name: 'Fragmento de Piedra Antigua', chance: 0.10 } 
    },
    profunda: { 
        name: 'Espíritu de la Mina', hp: 250, dmg: 28, reward: 4500,
        rareLoot: { id: 'esencia_oscura', name: 'Esencia Oscura', chance: 0.15 } 
    },
    volcan: { 
        name: 'Guardián Volcánico', hp: 600, dmg: 50, reward: 15000,
        rareLoot: { id: 'nucleo_magma', name: 'Núcleo de Magma', chance: 0.20 } 
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('Mina recursos y lucha contra jefes'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        // Cooldown: 0 para Premium, 60s para normales
        const isPremium = data.subscription?.active || false;
        const cooldown = checkAndSetCooldown(userId, 'mine', 60);
        
        if (cooldown > 0 && !isPremium) {
             return interaction.reply({ content: `⏱️ Espera **${cooldown.toFixed(1)}s**. ¡Los Premium no tienen cooldown!`, flags: MessageFlags.Ephemeral });
        }

        if (!data.equippedPickaxe || !data.equippedPickaxe.name) {
            return interaction.reply({ content: `❌ No tienes un pico equipado.`, flags: MessageFlags.Ephemeral });
        }

        const subTier = data.subscription?.tier || 'none';
        const moneyMult = isPremium ? (subTier === 'ultra' ? 8 : 5) : 1;
        const luckMult = isPremium ? (subTier === 'ultra' ? 2 : 1.5) : 1;

        const zoneId = data.equippedPickaxe.level >= 20 ? 'volcan' : (data.equippedPickaxe.level >= 10 ? 'profunda' : 'comun');
        
        // Desgaste (Premium gasta menos)
        data.equippedPickaxe.durability -= isPremium ? 1 : 3;

        if (Math.random() < (0.08 * luckMult)) {
            return await startBossFight(interaction, data, BOSSES[zoneId], moneyMult, luckMult);
        }

        const gain = Math.floor((Math.random() * 50 + 20) * moneyMult);
        const material = zoneId === 'comun' ? 'piedra' : (zoneId === 'profunda' ? 'hierro' : 'oro');
        
        data.wallet += gain;
        data.inventory[material] = (data.inventory[material] || 0) + 1;

        await updateUserData(userId, data);
        return interaction.reply(`⛏️ Minaste en **${zoneId}**.\n💰 Ganaste **${gain}** ${ICONS.money}\n📦 Obtuviste **1x ${material}**`);
    }
};

// ... (Aquí incluirías la función startBossFight que te pasé anteriormente) ...