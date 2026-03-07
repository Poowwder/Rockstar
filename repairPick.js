const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, addItemToInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');

const ICONS = {
    repair: '🛠️',
    money: '🌸',
    error: '❌',
};
const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

const getMiningPicks = () => {
    const p = path.join(__dirname, '../data/mining_picks.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repair')
        .setDescription('Repara tu pico actual.')
        ,
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const data = getUserData(userId);
        const miningPicks = getMiningPicks();

        // Verificar si el usuario tiene un pico equipado
       if (!data.equippedMiningPick) {
           return interaction.reply({ content: `${ICONS.error} No tienes un pico equipado.`, flags: MessageFlags.Ephemeral });
       }

       const pick = data.inventory.find(item => item.id === data.equippedMiningPick);
        if (!pick) {
            return interaction.reply({ content: `${ICONS.error} No tienes ese pico en el inventario.`, flags: MessageFlags.Ephemeral });
        }

       const pickInfo = miningPicks[data.equippedMiningPick];
        if (!pickInfo) {
          return interaction.reply({ content: `${ICONS.error} Pico inválido.`, flags: MessageFlags.Ephemeral });
        }

      

        // Aquí iría la lógica para calcular el costo de reparación
        // y deducir el dinero del usuario.

        // Luego, restaurar la durabilidad al máximo.
        pick.durability = pick.maxDurability;
        updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.repair} Pico Reparado`)
            .setDescription(`Tu pico ${pickInfo.name} ha sido reparado. Durabilidad restaurada al máximo.`)
            .setColor(COLORS.primary);
        await interaction.reply({ embeds: [embed] });
    },
};