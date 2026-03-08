const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder().setName('mine').setDescription('Mina materiales'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const tier = data.premiumType || 'normal';

        const now = Date.now();
        const baseCD = 5 * 60 * 1000; // 5 min
        let cd = tier === 'bimestral' ? 0 : (tier === 'mensual' ? 2 * 60 * 1000 : baseCD);

        if (cd > 0 && now - (data.lastMine || 0) < cd) return interaction.reply("⏳ Cooldown activo.");
        if (!data.equippedPickaxe || data.equippedPickaxe.durability <= 0) return interaction.reply("❌ Revisa tu pico.");

        const mins = ['stone', 'iron_ore', 'diamond'];
        const res = mins[Math.floor(Math.random() * mins.length)];
        
        data.inventory[res] = (data.inventory[res] || 0) + 1;
        data.equippedPickaxe.durability--;
        data.lastMine = now;

        await updateUserData(userId, data);
        await addXP(userId, 15, interaction, { getUserData, updateUserData });

        return interaction.reply(`⛏️ Minaste **${res}**. Durabilidad: ${data.equippedPickaxe.durability}`);
    }
};