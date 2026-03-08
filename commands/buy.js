const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la Tienda Rockstar ✨')
        .addStringOption(opt => 
            opt.setName('item')
                .setDescription('Nombre o ID del artículo que quieres comprar')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemNameInput = interaction.options.getString('item').toLowerCase();
        const member = interaction.guild.members.cache.get(userId);
        const apodo = member?.nickname || interaction.user.username;

        // 1. CARGAR TIENDA
        const shopPath = path.join(__dirname, '../data/shop.json');
        if (!fs.existsSync(shopPath)) return interaction.reply("❌ La tienda no está configurada correctamente.");
        const shopData = JSON.parse(fs.readFileSync(shopPath, 'utf8'));

        // 2. BUSCAR ITEM (Por ID o por nombre)
        const itemKey = Object.keys(shopData).find(key => 
            key.toLowerCase() === itemNameInput || 
            shopData[key].name.toLowerCase() === itemNameInput
        );

        const item = shopData[itemKey];

        if (!item) {
            return interaction.reply({ 
                content: `❌ No encontré el artículo **"${itemNameInput}"**. Revisa la \`!!shop\` para ver los nombres exactos.`, 
                ephemeral: true 
            });
        }

        // 3. VALIDAR SALDO
        const data = await getUserData(userId);
        if (data.wallet < item.price) {
            return interaction.reply({ 
                content: `❌ No tienes suficientes flores. Necesitas **${item.price} 🌸** y solo tienes **${data.wallet} 🌸**.`, 
                ephemeral: true 
            });
        }

        // 4. PROCESAR COMPRA
        data.wallet -= item.price;
        if (!data.inventory) data.inventory = {};
        data.inventory[itemKey] = (data.inventory[itemKey] || 0) + 1;

        await updateUserData(userId, data);

        // GIF Aesthetic de agradecimiento o cajita cute
        const buyGif = "https://i.pinimg.com/originals/a1/3e/2e/a13e2e09657685600643763261647416.gif";

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🛍️ Compra Exitosa: ${apodo}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTitle('✨ ¡Gracias por tu compra!')
            .setColor('#B9F2FF') // Color celeste pastel muy aesthetic
            .setThumbnail(buyGif)
            .setDescription(`**${apodo}**, has adquirido un nuevo objeto para tu mochila.\n\n**Artículo:** ${item.icon} \`${item.name}\`\n**Precio pagado:** \`${item.price} 🌸\`\n\n**Saldo restante:** \`${data.wallet} 🌸\`\n\n*Usa \`!!inventory\` para ver tus pertenencias.*`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Market 🎀`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};