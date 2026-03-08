const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcolor')
        .setDescription('Usa un tinte mágico para cambiar el color de tu perfil'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        // Verificamos si tiene el objeto en el inventario
        if (!data.inventory || !data.inventory.dye || data.inventory.dye <= 0) {
            return interaction.reply("❌ Necesitas comprar un **Tinte Mágico** (🎨) en la tienda para cambiar tu color.");
        }

        // Generamos un color hexadecimal aleatorio
        const nuevoColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        
        // Consumimos el item y guardamos el color
        data.inventory.dye -= 1;
        data.profileColor = nuevoColor;
        
        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle('🎨 ¡Perfil Teñido!')
            .setDescription(`Has usado un tinte mágico.\nTu nuevo color de perfil es: **${nuevoColor.toUpperCase()}**`)
            .setColor(nuevoColor)
            .setFooter({ text: 'Usa /profile para ver el resultado ✨' });

        return interaction.reply({ embeds: [embed] });
    }
};