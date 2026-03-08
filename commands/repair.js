const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repair')
        .setDescription('Repara tu herramienta equipada usando flores'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        // 1. Verificar si tiene un pico equipado
        if (!data.equippedPickaxe || !data.equippedPickaxe.name) {
            return interaction.reply("❌ No tienes ningún pico equipado para reparar.");
        }

        const pick = data.equippedPickaxe;

        // 2. Verificar si ya está al máximo de durabilidad
        if (pick.durability >= pick.maxDurability) {
            return interaction.reply(`🛠️ Tu **${pick.name}** ya está en perfectas condiciones (${pick.durability}/${pick.maxDurability}).`);
        }

        // 3. Calcular el costo de reparación
        // Ejemplo: 2 flores por cada punto de durabilidad perdido
        const pointsToRepair = pick.maxDurability - pick.durability;
        const costPerPoint = 2; 
        const totalCost = pointsToRepair * costPerPoint;

        // 4. Verificar si tiene suficiente dinero
        if (data.wallet < totalCost) {
            return interaction.reply(`❌ No tienes suficientes flores. Reparar tu pico cuesta **${totalCost} 🌸** y solo tienes **${data.wallet} 🌸**.`);
        }

        // 5. Aplicar reparación y cobrar
        data.wallet -= totalCost;
        data.equippedPickaxe.durability = pick.maxDurability;

        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle('🛠️ Herramienta Reparada')
            .setDescription(`Has reparado tu **${pick.name}** satisfactoriamente.`)
            .addFields(
                { name: '💰 Costo', value: `${totalCost} 🌸`, inline: true },
                { name: '🔧 Estado Final', value: `${pick.maxDurability}/${pick.maxDurability}`, inline: true }
            )
            .setColor('#3498db')
            .setFooter({ text: `Saldo restante: ${data.wallet} 🌸` });

        return interaction.reply({ embeds: [embed] });
    }
};