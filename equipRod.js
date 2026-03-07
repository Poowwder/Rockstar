const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

const ICONS = {
    rod: '🎣',
    error: '❌',
};

const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip_rod')
        .setDescription('Equip a fishing rod from your inventory.')
        .addStringOption(option =>
            option.setName('rod_id')
                .setDescription('The ID of the fishing rod to equip.')
                .setRequired(true)),
    category: 'currency',
    async execute(interaction) {
        const userId = interaction.user.id;
        const rodId = interaction.options.getString('rod_id');

        const data = await getUserData(userId);

		if (!data.hasPremium) {
            return interaction.reply({
                content: `${ICONS.error} You need a the premium role to equip this fishing rod.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Check if the rod exists in the user's inventory
        const rodInInventory = data.inventory.find(item => item.id === rodId);
        if (!rodInInventory) {
            return interaction.reply({
                content: `${ICONS.error} You don't have a fishing rod with the ID \`${rodId}\` in your inventory.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Equip the rod
        data.equippedFishingRod = rodId;
        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.rod} Rod Equipped`)
            .setDescription(`You have equipped the fishing rod with ID \`${rodId}\`.`)
            .setColor(COLORS.primary);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};

/*
COMMAND: equip_rod
CATEGORY: currency

DESCRIPTION: Equips a fishing rod from the user's inventory.

USAGE
/equip_rod <rod_id>
*/