const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip_rod')
        .setDescription('Equipa una caña de pescar'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        data.equippedFishingRod = {
            name: "Caña de Bambú",
            level: data.equippedFishingRod?.level || 1,
            durability: 100,
            maxDurability: 100
        };

        await updateUserData(userId, data);
        return interaction.reply({ content: `✅ Has equipado tu **Caña de Bambú**.`, flags: MessageFlags.Ephemeral });
    }
};