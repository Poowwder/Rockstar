const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const { getUserData, updateUserData, decreaseResource } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Muestra tu perfil, materiales y gestiona tus herramientas'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const isPremium = data.subscription?.active || false;

        const createEmbed = () => {
            const rod = data.equippedFishingRod || {};
            const pick = data.equippedPickaxe || {};

            const embed = new EmbedBuilder()
                .setTitle(`🎒 Mochila de ${interaction.user.username}`)
                .setColor(isPremium ? '#f1c40f' : '#5865F2')
                .addFields(
                    { name: '💰 Billetera', value: `${data.wallet.toLocaleString()} 🌸`, inline: true },
                    { name: '✨ Rango', value: isPremium ? `Premium (${data.subscription.tier.toUpperCase()})` : 'Estándar', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '⛏️ Pico Equipado', value: `**${pick.name || 'Ninguno'}**\nNivel: ${pick.level || 0}\nDurabilidad: ${pick.durability || 0}/${pick.maxDurability || 100}`, inline: true },
                    { name: '🎣 Caña Equipada', value: `**${rod.name || 'Ninguna'}**\nNivel: ${rod.level || 0}\nDurabilidad: ${rod.durability || 0}/${rod.maxDurability || 100}`, inline: true },
                    { name: '📦 Materiales', value: `🪵 Madera: ${data.inventory.madera || 0}\n⛓️ Hierro: ${data.inventory.hierro || 0}\n📀 Oro: ${data.inventory.oro || 0}\n💎 Diamante: ${data.inventory.diamante || 0}`, inline: false }
                );
            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('repair_menu').setLabel('Reparar').setEmoji('🔧').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('open_shop').setLabel('Tienda').setEmoji('🛒').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({ embeds: [createEmbed()], components: [row] });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: 'No puedes usar este menú.', ephemeral: true });

            if (i.customId === 'open_shop') {
                if (!isPremium) {
                    return i.reply({ content: '✨ La tienda rápida es solo para usuarios **Premium**. Usa el comando `/shop` normal.', ephemeral: true });
                }
                return i.reply({ content: '🛒 Abriendo tienda rápida...', ephemeral: true });
            }

            if (i.customId === 'repair_menu') {
                const cost = isPremium ? 4 : 10;
                const repairRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('rep_pick').setLabel('Pico').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('rep_rod').setLabel('Caña').setStyle(ButtonStyle.Primary)
                );
                await i.reply({ content: `🔧 ¿Qué deseas reparar? Costo: **${cost} Madera**`, components: [repairRow], ephemeral: true });
            }

            // Lógica interna de reparación (solo para botones dentro del ephemeral)
            if (i.customId.startsWith('rep_')) {
                const toolKey = i.customId === 'rep_pick' ? 'equippedPickaxe' : 'equippedFishingRod';
                const cost = isPremium ? 4 : 10;

                if ((data.inventory.madera || 0) >= cost) {
                    data.inventory.madera -= cost;
                    data[toolKey].durability = data[toolKey].maxDurability;
                    await updateUserData(userId, data);
                    await i.update({ content: `✅ ¡${data[toolKey].name} reparado!`, components: [] });
                } else {
                    await i.update({ content: `❌ No tienes suficiente madera (${cost} necesaria).`, components: [] });
                }
            }
        });
    }
};