const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Regala flores o items')
        .addUserOption(o => o.setName('usuario').setDescription('A quién regalar').setRequired(true))
        .addIntegerOption(o => o.setName('flores').setDescription('Cantidad de flores'))
        .addStringOption(o => o.setName('item').setDescription('ID del item (ej: dye)')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const flores = interaction.options.getInteger('flores');
        const itemId = interaction.options.getString('item');
        
        if (target.id === interaction.user.id) return interaction.reply("❌ No puedes regalarte a ti mismo.");

        let data = await getUserData(interaction.user.id);
        let tData = await getUserData(target.id);

        if (flores) {
            if (data.wallet < flores) return interaction.reply("❌ No tienes suficientes flores.");
            data.wallet -= flores;
            tData.wallet += flores;
            await updateUserData(interaction.user.id, data);
            await updateUserData(target.id, tData);
            return interaction.reply(`🎁 ¡Has enviado **${flores} 🌸** a **${target.username}**!`);
        }

        if (itemId) {
            if (!data.inventory[itemId] || data.inventory[itemId] <= 0) return interaction.reply("❌ No tienes ese item.");
            data.inventory[itemId] -= 1;
            tData.inventory[itemId] = (tData.inventory[itemId] || 0) + 1;
            await updateUserData(interaction.user.id, data);
            await updateUserData(target.id, tData);
            return interaction.reply(`🎁 ¡Has regalado un **${itemId}** a **${target.username}**!`);
        }

        return interaction.reply("❓ Debes especificar flores o un item para regalar.");
    }
};