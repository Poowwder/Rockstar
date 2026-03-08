const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Usa un objeto de tu mochila')
        .addStringOption(o => o.setName('item').setDescription('ID del objeto a usar').setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemId = interaction.options.getString('item').toLowerCase();
        const data = await getUserData(userId);

        if (!data.inventory[itemId] || data.inventory[itemId] <= 0) {
            return interaction.reply(`❌ No tienes **${itemId}** en tu mochila.`);
        }

        // LÓGICA SEGÚN EL OBJETO
        let resultMessage = "";
        
        if (itemId === 'luck_potion') {
            // Ejemplo: Reiniciar cooldown de trabajo
            data.lastWork = 0;
            resultMessage = "🧪 ¡Has bebido la **Poción de Suerte**! Tu energía se ha restaurado y puedes volver a trabajar inmediatamente.";
        } 
        else if (itemId === 'daily_box') {
            const prize = Math.floor(Math.random() * 2000) + 500;
            data.wallet += prize;
            resultMessage = `🎁 Has abierto la **Caja Diaria** y encontraste **${prize} 🌸**!`;
        } 
        else {
            return interaction.reply("❌ Este objeto no se puede usar o es un material de crafteo.");
        }

        // Consumir el objeto
        data.inventory[itemId] -= 1;
        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle('🎒 Objeto Usado')
            .setDescription(resultMessage)
            .setColor('#4dd0e1');

        return interaction.reply({ embeds: [embed] });
    }
};