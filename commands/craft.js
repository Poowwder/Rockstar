const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');
const fs = require('fs');
const path = require('path');

const recipesPath = path.join(__dirname, '../data/recipes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('Fabrica herramientas (Cuidado: puede fallar)')
        .addStringOption(opt => opt.setName('item').setDescription('ID del objeto').setRequired(false)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        const itemToCraft = interaction.options.getString('item')?.toLowerCase();
        const data = await getUserData(userId);

        if (!itemToCraft) {
            // ... (Mismo código de lista que ya tienes) ...
            return interaction.reply("Usa `/craft <id>` para fabricar. Mira la lista en `!craft`.");
        }

        const recipe = recipes[itemToCraft];
        if (!recipe) return interaction.reply("❌ Esa receta no existe.");

        // Verificar materiales
        for (const mat in recipe.materials) {
            if ((data.inventory[mat] || 0) < recipe.materials[mat]) {
                return interaction.reply(`❌ No tienes suficiente **${mat}**.`);
            }
        }

        // --- LÓGICA DE FALLO ---
        const isPremium = data.premiumType && data.premiumType !== 'normal';
        const failChance = isPremium ? 0.10 : 0.30; // 10% vs 30%
        const random = Math.random();

        // Consumir materiales siempre (se usen o se pierdan)
        for (const mat in recipe.materials) {
            data.inventory[mat] -= recipe.materials[mat];
        }

        if (random < failChance) {
            await updateUserData(userId, data);
            return interaction.reply({
                content: `💥 **¡EL CRAFTEO HA FALLADO!** Los materiales se han destruido en el proceso. ${isPremium ? 'Tu seguro Premium redujo el riesgo, pero la suerte no estuvo de tu lado.' : '¡Qué mala suerte! Los usuarios Premium tienen menos riesgo de fallo.'}`
            });
        }

        // --- ÉXITO ---
        data.inventory[itemToCraft] = (data.inventory[itemToCraft] || 0) + 1;
        await updateUserData(userId, data);
        await addXP(userId, 150, interaction, { getUserData, updateUserData });

        return interaction.reply(`⚒️ ¡Éxito! Has fabricado **${recipe.name}** y ganado **150 XP**.`);
    }
};