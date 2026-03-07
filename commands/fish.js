const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags 
} = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../economyManager.js');

const ICONS = { rod: '🎣', money: '🌸', fish: '🐟' };

const FISH_TYPES = [
    { name: 'Sardina', price: 30, chance: 0.50, xp: 5 },
    { name: 'Salmón', price: 80, chance: 0.30, xp: 12 },
    { name: 'Pez Globo', price: 200, chance: 0.15, xp: 25 },
    { name: 'Leviatán', price: 2500, chance: 0.01, xp: 200 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Pesca peces y tesoros marinos'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const isPremium = data.subscription?.active || false;

        const cooldown = checkAndSetCooldown(userId, 'fish', 45);
        if (cooldown > 0 && !isPremium) {
            return interaction.reply({ content: `⏱️ Espera **${cooldown.toFixed(1)}s**.`, flags: MessageFlags.Ephemeral });
        }

        if (!data.equippedFishingRod?.name || data.equippedFishingRod.durability <= 0) {
            return interaction.reply({ content: `❌ Tu caña no está equipada o está rota.`, flags: MessageFlags.Ephemeral });
        }

        const subTier = data.subscription?.tier || 'none';
        const moneyMult = isPremium ? (subTier === 'ultra' ? 8 : 5) : 1;
        
        // Riesgo de rotura reducido para Premium
        if (Math.random() < (isPremium ? 0.02 : 0.08)) {
            data.equippedFishingRod.durability -= 10;
            await updateUserData(userId, data);
            return interaction.reply(`💥 ¡La línea se tensó demasiado! Tu caña perdió **10 de durabilidad**.`);
        }

        const rand = Math.random();
        let caught = FISH_TYPES[0];
        let cumulative = 0;
        for (const f of FISH_TYPES) {
            cumulative += f.chance;
            if (rand < cumulative) { caught = f; break; }
        }

        const finalGain = Math.floor(caught.price * moneyMult);
        data.wallet += finalGain;
        data.experience += caught.xp;
        data.equippedFishingRod.durability -= 1;

        // Regalo de madera (más probable para Premium)
        if (Math.random() < (isPremium ? 0.25 : 0.10)) {
            data.inventory.madera = (data.inventory.madera || 0) + 1;
        }

        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.rod} ¡Pescaste algo!`)
            .setColor('#3498db')
            .setDescription(`Atrapaste un **${caught.name}**.\n\n💰 Monedas: **${finalGain}**\n✨ XP: **+${caught.xp}**`)
            .setFooter({ text: `Durabilidad: ${data.equippedFishingRod.durability}/${data.equippedFishingRod.maxDurability}` });

        return interaction.reply({ embeds: [embed] });
    }
};