const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip_pick')
        .setDescription('Equipa un pico de tu inventario')
        .addStringOption(option => 
            option.setName('tipo')
                .setDescription('El tipo de pico a equipar')
                .setRequired(true)
                .addChoices(
                    { name: 'Pico de Madera', value: 'Pico de Madera' },
                    { name: 'Pico de Hierro', value: 'Pico de Hierro' },
                    { name: 'Pico de Oro', value: 'Pico de Oro' }
                )),

    async execute(interaction) {
        const userId = interaction.user.id;
        const tipo = interaction.options.getString('tipo');
        const data = await getUserData(userId);

        // Actualizamos el objeto equippedPickaxe en la DB
        data.equippedPickaxe = {
            name: tipo,
            level: data.equippedPickaxe?.level || 1,
            durability: 100,
            maxDurability: 100
        };

        await updateUserData(userId, data);
        return interaction.reply({ content: `✅ Has equipado: **${tipo}**`, flags: MessageFlags.Ephemeral });
    }
};