const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('box')
        .setDescription('Reclama tus cajas de botín (Beneficios Premium disponibles)')
        .addSubcommand(sub => sub.setName('daily').setDescription('Reclama tus cajas diarias'))
        .addSubcommand(sub => sub.setName('weekly').setDescription('Reclama tus cajas semanales')),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const sub = interaction.options.getSubcommand();
        const shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));

        // --- DEFINICIÓN DE NIVELES PREMIUM ---
        const userTier = data.premiumType || 'normal'; // 'normal', 'mensual', 'bimestral'
        
        const config = {
            normal:    { d_limit: 1, w_limit: 1, color: '#95a5a6' },
            mensual:   { d_limit: 2, w_limit: 3, color: '#3498db' },
            bimestral: { d_limit: 3, w_limit: 4, color: '#f1c40f' }
        };

        const tier = config[userTier];
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekMs = 7 * dayMs;

        // Lógica de usos (usamos un contador y un reset de tiempo)
        if (sub === 'daily') {
            if (!data.lastDailyReset || now - data.lastDailyReset > dayMs) {
                data.dailyCount = 0;
                data.lastDailyReset = now;
            }
            if (data.dailyCount >= tier.d_limit) {
                return interaction.reply(`❌ Has agotado tus **${tier.d_limit}** cajas diarias. ¡Sube a Premium para más!`);
            }
            data.dailyCount++;
        } else {
            if (!data.lastWeeklyReset || now - data.lastWeeklyReset > weekMs) {
                data.weeklyCount = 0;
                data.lastWeeklyReset = now;
            }
            if (data.weeklyCount >= tier.w_limit) {
                return interaction.reply(`❌ Has agotado tus **${tier.w_limit}** cajas semanales.`);
            }
            data.weeklyCount++;
        }

        // --- GENERACIÓN DE PREMIOS ---
        const moneyReward = sub === 'daily' ? 250 : 1500;
        const itemsToGet = sub === 'daily' ? 2 : 5;
        let lootList = `💰 **Efectivo:** +${moneyReward} 🌸\n`;

        const items = Object.keys(shopItems);
        for(let i=0; i < itemsToGet; i++) {
            const id = items[Math.floor(Math.random() * items.length)];
            const item = shopItems[id];
            data.inventory[id] = (data.inventory[id] || 0) + 1;
            lootList += `${item.icon || '📦'} ${item.name}\n`;
        }

        data.wallet += moneyReward;
        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`🎁 Caja ${sub === 'daily' ? 'Diaria' : 'Semanal'} (${userTier.toUpperCase()})`)
            .setDescription(`¡Has abierto una caja de nivel **${userTier}**!\n\n${lootList}`)
            .setColor(tier.color)
            .setFooter({ text: `Cajas restantes hoy/esta semana: ${sub === 'daily' ? tier.d_limit - data.dailyCount : tier.w_limit - data.weeklyCount}` });

        return interaction.reply({ embeds: [embed] });
    }
};