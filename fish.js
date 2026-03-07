const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const { getUserData, updateUserData, decreaseResource } = require('../economyManager.js');

const ICONS = {
    rod: '🎣',
    money: '🌸',
    wood: '🪵',
    iron: '⛓️',
    gold: '📀',
    diamond: '💎',
    boss_item: '☄️',
    enchant: '🔮',
    durability: '🛠️',
    amuleto: '🔰',
    repair: '🔧',
    shop: '🛒'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your status and access the quick shop'),

    async execute(interaction) {
        const userId = interaction.user.id;
        let data = getUserData(userId);

        // --- Función para crear el Embed de Inventario ---
        const createInventoryEmbed = () => {
            const embed = new EmbedBuilder()
                .setTitle(`🎒 Inventario de ${interaction.user.username}`)
                .setColor('#5865F2')
                .setThumbnail(interaction.user.displayAvatarURL());

            embed.addFields({ 
                name: '💰 Economía', 
                value: `**Billetera:** ${data.wallet.toLocaleString()} ${ICONS.money}\n**Nivel:** ${data.level || 1} (${data.xp || 0} XP)`,
                inline: false 
            });

            if (data.equippedRod) {
                const rod = data.equippedRod;
                const enchants = rod.enchants || {};
                const enchantList = Object.entries(enchants)
                    .map(([tipo, lvl]) => `${ICONS.enchant} ${tipo.replace('_', ' ')} **${'I'.repeat(lvl)}**`)
                    .join('\n') || '*Sin encantamientos*';

                const durabilidad = rod.durability ?? 100;
                const bloquesLlenos = Math.ceil(durabilidad / 10);
                const barrita = '🟩'.repeat(bloquesLlenos) + '⬜'.repeat(10 - bloquesLlenos);

                embed.addFields({
                    name: `${ICONS.rod} Herramienta: ${rod.name || 'Caña Básica'}`,
                    value: `**Durabilidad:** ${durabilidad}/100\n${barrita}\n\n**Encantamientos:**\n${enchantList}`,
                    inline: false
                });
            }

            const inv = data.inventory || {};
            const materiales = `${ICONS.wood} Madera: \`${inv.madera || 0}\` | ${ICONS.iron} Hierro: \`${inv.hierro || 0}\` | ${ICONS.gold} Oro: \`${inv.oro || 0}\``;
            const raros = `**Esencias:** \`${inv.esencia_oscura || 0}\` | **Núcleos:** \`${inv.nucleo_magma || 0}\``;

            embed.addFields(
                { name: '⛏️ Materiales', value: materiales || '*Vacío*', inline: false },
                { name: `${ICONS.boss_item} Botín Especial`, value: raros || '*Vacío*', inline: false }
            );

            if ((inv.amuleto_proteccion || 0) > 0) {
                embed.addFields({ name: '✨ Especiales', value: `${ICONS.amuleto} Amuleto de Protección: x${inv.amuleto_proteccion}`, inline: false });
            }

            return embed;
        };

        // --- Función para crear los Botones ---
        const createButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('repair_rod')
                    .setLabel('Reparar (10 Madera)')
                    .setEmoji(ICONS.repair)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!data.equippedRod || (data.equippedRod.durability || 100) >= 100),
                new ButtonBuilder()
                    .setCustomId('open_shop')
                    .setLabel('Tienda Rápida')
                    .setEmoji(ICONS.shop)
                    .setStyle(ButtonStyle.Primary)
            );
        };

        const response = await interaction.reply({ 
            embeds: [createInventoryEmbed()], 
            components: [createButtons()],
            fetchReply: true 
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ No puedes usar este inventario.', ephemeral: true });

            // LÓGICA DE REPARAR
            if (i.customId === 'repair_rod') {
                if (decreaseResource(userId, 'madera', 10)) {
                    data.equippedRod.durability = 100;
                    updateUserData(userId, data);
                    await i.update({ embeds: [createInventoryEmbed()], components: [createButtons()] });
                } else {
                    await i.reply({ content: '❌ No tienes madera suficiente.', ephemeral: true });
                }
            }

            // LÓGICA DE TIENDA RÁPIDA
            if (i.customId === 'open_shop') {
                const shopEmbed = new EmbedBuilder()
                    .setTitle(`${ICONS.shop} Tienda de Suministros`)
                    .setColor('#F1C40F')
                    .setDescription('Compra lo necesario para tus herramientas:')
                    .addFields(
                        { name: `📦 Madera (x10)`, value: `Precio: 5,000 ${ICONS.money}`, inline: true },
                        { name: `${ICONS.amuleto} Amuleto`, value: `Precio: 50,000 ${ICONS.money}`, inline: true }
                    );

                const shopButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('buy_wood').setLabel('Comprar Madera').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('buy_amuleto').setLabel('Comprar Amuleto').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('back_inv').setLabel('Volver').setStyle(ButtonStyle.Danger)
                );

                await i.update({ embeds: [shopEmbed], components: [shopButtons] });
            }

            // LÓGICA DE COMPRA
            if (i.customId.startsWith('buy_')) {
                const item = i.customId === 'buy_wood' ? 'madera' : 'amuleto_proteccion';
                const price = i.customId === 'buy_wood' ? 5000 : 50000;
                const qty = i.customId === 'buy_wood' ? 10 : 1;

                if (data.wallet >= price) {
                    data.wallet -= price;
                    data.inventory[item] = (data.inventory[item] || 0) + qty;
                    updateUserData(userId, data);
                    await i.reply({ content: `✅ Compraste ${qty}x ${item.replace('_', ' ')} por ${price}${ICONS.money}`, ephemeral: true });
                } else {
                    await i.reply({ content: '❌ No tienes dinero suficiente.', ephemeral: true });
                }
            }

            if (i.customId === 'back_inv') {
                await i.update({ embeds: [createInventoryEmbed()], components: [createButtons()] });
            }
        });
    }
};