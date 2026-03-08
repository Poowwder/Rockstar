const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Mercado y Subastas')
        .addSubcommand(sub => 
            sub.setName('subastar')
                .setDescription('Pon un objeto en subasta (1 hora)')
                .addStringOption(o => o.setName('item').setDescription('ID del objeto').setRequired(true))
                .addIntegerOption(o => o.setName('base').setDescription('Precio inicial').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('pujar')
                .setDescription('Puja por una subasta')
                .addUserOption(o => o.setName('vendedor').setDescription('A quién le pujas').setRequired(true))
                .addIntegerOption(o => o.setName('cantidad').setDescription('Tu oferta').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        if (sub === 'subastar') {
            const itemId = interaction.options.getString('item');
            const basePrice = interaction.options.getInteger('base');

            if (!data.inventory || !data.inventory[itemId] || data.inventory[itemId] <= 0) {
                return interaction.reply("❌ No tienes ese objeto en tu inventario.");
            }

            if (data.activeAuction) return interaction.reply("❌ Ya tienes una subasta activa.");

            // Quitar item del inventario para la subasta
            data.inventory[itemId]--;
            
            // Configurar subasta
            data.activeAuction = {
                item: itemId,
                currentBid: basePrice,
                highestBidder: null,
                endsAt: Date.now() + (60 * 60 * 1000) // 1 hora
            };

            await updateUserData(userId, data);

            const embed = new EmbedBuilder()
                .setTitle('🔨 Nueva Subasta')
                .setDescription(`<@${userId}> está subastando un **${itemId}**!`)
                .addFields(
                    { name: '💰 Precio Base', value: `${basePrice} 🌸`, inline: true },
                    { name: '⏳ Finaliza en', value: `<t:${Math.floor(data.activeAuction.endsAt / 1000)}:R>`, inline: true }
                )
                .setColor('#f1c40f');

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'pujar') {
            const seller = interaction.options.getUser('vendedor');
            const bid = interaction.options.getInteger('cantidad');

            if (seller.id === userId) return interaction.reply("❌ No puedes pujar en tu propia subasta.");

            const sellerData = await getUserData(seller.id);
            if (!sellerData.activeAuction) return interaction.reply("❌ Este usuario no tiene subastas activas.");

            if (bid <= sellerData.activeAuction.currentBid) {
                return interaction.reply(`❌ La puja mínima es de **${sellerData.activeAuction.currentBid + 1} 🌸**.`);
            }

            if (data.wallet < bid) return interaction.reply("❌ No tienes suficiente dinero para esta puja.");

            // Actualizar la subasta del vendedor
            sellerData.activeAuction.currentBid = bid;
            sellerData.activeAuction.highestBidder = userId;

            await updateUserData(seller.id, sellerData);
            return interaction.reply(`📈 ¡Has pujado **${bid} 🌸** por el objeto de ${seller.username}!`);
        }
    }
};