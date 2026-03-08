const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const shopData = require('../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Usa un objeto de tu mochila ✨')
        .addStringOption(opt => 
            opt.setName('item')
                .setDescription('Nombre del objeto que quieres usar')
                .setRequired(true))
        .addStringOption(opt => 
            opt.setName('argumento')
                .setDescription('Color hex (ej: #FFB6C1) si usas un Pincel')
                .setRequired(false)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemNameInput = interaction.options.getString('item').toLowerCase();
        const argumento = interaction.options.getString('argumento');
        const member = interaction.guild.members.cache.get(userId);
        const apodo = member?.nickname || interaction.user.username;

        const data = await getUserData(userId);
        const inventario = data.inventory || {};

        // 1. BUSCAR EL ITEM EN EL INVENTARIO
        const itemKey = Object.keys(inventario).find(key => 
            key.toLowerCase() === itemNameInput || 
            (shopData[key] && shopData[key].name.toLowerCase() === itemNameInput)
        );

        if (!itemKey || inventario[itemKey] <= 0) {
            return interaction.reply({ 
                content: `❌ No tienes **"${itemNameInput}"** en tu mochila. ¡Ve a la \`!!shop\` para comprar uno!`, 
                ephemeral: true 
            });
        }

        const itemInfo = shopData[itemKey];
        const nombreItem = itemInfo ? itemInfo.name : itemKey;

        // --- LÓGICA DE USOS ESPECIALES ---

        // CASO A: CAMBIAR COLOR DE PERFIL (Pinceles / Tintes)
        if (nombreItem.toLowerCase().includes('pincel') || nombreItem.toLowerCase().includes('tinte')) {
            if (!argumento || !/^#[0-9A-F]{6}$/i.test(argumento)) {
                return interaction.reply({ 
                    content: `🎨 Para usar el **${nombreItem}**, debes escribir un color hexadecimal válido.\nEjemplo: \`!!use ${itemKey} #FFB6C1\``, 
                    ephemeral: true 
                });
            }

            data.profileColor = argumento;
            inventario[itemKey] -= 1; // Consumir el item
            await updateUserData(userId, data);

            const embedColor = new EmbedBuilder()
                .setAuthor({ name: `🎨 Estilo de ${apodo}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTitle('✨ ¡Nuevo Color de Perfil!')
                .setColor(argumento)
                .setThumbnail("https://i.pinimg.com/originals/44/93/81/449381775e7a9b6d8a3959c99182312b.gif")
                .setDescription(`**${apodo}**, has usado tu **${nombreItem}** para cambiar tu color de perfil a \`${argumento}\`.\n\n*¡Ahora tu perfil se ve más aesthetic!*`)
                .setFooter({ text: `${interaction.guild.name} • Rockstar Boutique`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            return interaction.reply({ embeds: [embedColor] });
        }

        // CASO B: CONSUMIBLES (Comida/Bebida para XP)
        if (nombreItem.toLowerCase().includes('ramen') || nombreItem.toLowerCase().includes('te')) {
            inventario[itemKey] -= 1;
            const xpGanada = 50;
            data.xp += xpGanada; // Necesitarás importar addXP si quieres que suba de nivel aquí
            await updateUserData(userId, data);

            return interaction.reply({ 
                content: `✨ Has consumido **${nombreItem}** y te sientes con más energía. (+${xpGanada} XP)` 
            });
        }

        // SI EL ITEM NO TIENE FUNCIÓN TODAVÍA
        return interaction.reply({ 
            content: `📦 Has usado **${nombreItem}**, pero parece que este objeto solo es decorativo por ahora.`, 
            ephemeral: true 
        });
    }
};