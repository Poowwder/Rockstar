const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bag')
        .setDescription('Mira los objetos y materiales que llevas en tu mochila')
        .addUserOption(opt => opt.setName('usuario').setDescription('Ver la mochila de otro usuario')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);
        
        // Cargar información de los objetos (iconos y nombres reales)
        let shopItems = {};
        if (fs.existsSync(shopPath)) {
            shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        }

        const inv = data.inventory || {};
        const embed = new EmbedBuilder()
            .setTitle(`🎒 Mochila de ${target.username}`)
            .setColor('#FFB6C1')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }));

        // 1. Equipamiento actual
        let equippedStr = "";
        if (data.equippedPickaxe) {
            equippedStr += `⛏️ **Pico:** ${data.equippedPickaxe.name}\n└ Durabilidad: \`${data.equippedPickaxe.durability}/${data.equippedPickaxe.maxDurability}\`\n`;
        }
        if (data.equippedRod) {
            equippedStr += `🎣 **Caña:** ${data.equippedRod.name}\n`;
        }
        
        embed.addFields({ name: '🛡️ Equipado actualmente', value: equippedStr || "Nada equipado", inline: false });

        // 2. Lista de objetos en la mochila
        let itemsList = "";
        const itemKeys = Object.keys(inv);
        
        // Filtramos solo los items que tienen cantidad mayor a 0
        const ownedItems = itemKeys.filter(id => inv[id] > 0);

        if (ownedItems.length === 0) {
            itemsList = "*Tu mochila está vacía...*";
        } else {
            for (const itemId of ownedItems) {
                const cantidad = inv[itemId];
                const itemInfo = shopItems[itemId];
                
                const icon = itemInfo?.icon || '📦';
                const name = itemInfo?.name || itemId;
                
                // Mostramos el ID en código para que sea fácil de copiar y usar en comandos
                itemsList += `${icon} **${name}** x${cantidad}\n└ \`ID: ${itemId}\`\n`;
            }
        }

        embed.addFields({ name: '📦 Contenido de la mochila', value: itemsList, inline: false });

        // 3. Status Premium (si lo tiene)
        if (data.premiumType && data.premiumType !== 'normal') {
            const status = data.premiumType === 'bimestral' ? '💎 VIP Bimestral' : '✨ VIP Mensual';
            embed.setFooter({ text: status });
        }

        return interaction.reply({ embeds: [embed] });
    }
};