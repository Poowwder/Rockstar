const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

// Cargamos los datos de los picos para saber su durabilidad máxima al equiparlos
const picksPath = path.join(__dirname, '../data/mining_picks.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equipa una herramienta de tu inventario')
        .addStringOption(option => 
            option.setName('objeto')
                .setDescription('Nombre o ID del objeto a equipar')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemToEquip = interaction.options.getString('objeto').toLowerCase();
        const data = await getUserData(userId);

        // 1. Verificar si tiene el objeto en el inventario
        // Buscamos una coincidencia exacta o que el nombre contenga el texto
        const inventoryItems = Object.keys(data.inventory || {});
        const foundItem = inventoryItems.find(item => item.toLowerCase() === itemToEquip || item.toLowerCase().includes(itemToEquip));

        if (!foundItem || data.inventory[foundItem] <= 0) {
            return interaction.reply(`❌ No tienes "**${itemToEquip}**" en tu inventario. ¡Cómpralo en la \`!shop\`!`);
        }

        // 2. Determinar qué tipo de herramienta es
        let type = '';
        if (foundItem.includes('pickaxe') || foundItem.includes('pico')) type = 'pickaxe';
        if (foundItem.includes('rod') || foundItem.includes('caña')) type = 'rod';

        if (!type) {
            return interaction.reply("❌ Ese objeto no se puede equipar como herramienta.");
        }

        // 3. Lógica para Picos (Minería)
        if (type === 'pickaxe') {
            let maxDur = 100; // Por defecto
            
            // Intentamos leer la durabilidad desde tu JSON de picos
            if (fs.existsSync(picksPath)) {
                const picksJson = JSON.parse(fs.readFileSync(picksPath, 'utf8'));
                if (picksJson[foundItem]) {
                    maxDur = picksJson[foundItem].durability || maxDur;
                }
            }

            data.equippedPickaxe = {
                id: foundItem,
                name: foundItem.replace(/_/g, ' ').toUpperCase(),
                durability: maxDur,
                maxDurability: maxDur
            };

            await updateUserData(userId, data);
            return interaction.reply(`⛏️ ¡Has equipado **${data.equippedPickaxe.name}** con éxito!`);
        }

        // 4. Lógica para Cañas (Pesca)
        if (type === 'rod') {
            data.equippedRod = {
                id: foundItem,
                name: foundItem.replace(/_/g, ' ').toUpperCase()
            };

            await updateUserData(userId, data);
            return interaction.reply(`🎣 ¡Has equipado la caña **${data.equippedRod.name}** con éxito!`);
        }
    }
};