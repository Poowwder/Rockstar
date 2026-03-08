const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('Visualiza los tesoros de tu mochila ✨')
        .addUserOption(opt => opt.setName('usuario').setDescription('Ver la mochila de otra persona')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);
        
        const apodo = member?.nickname || target.username;
        const inventario = data.inventory || {};
        
        // Cargar datos de la tienda para obtener Nombres y Emojis de los items
        const shopPath = path.join(__dirname, '../data/shop.json');
        let shopData = {};
        if (fs.existsSync(shopPath)) {
            shopData = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        }

        // GIF Aesthetic de una mochila/bolso cute (Pixel Art)
        const invGif = "https://i.pinimg.com/originals/a1/3e/2e/a13e2e09657685600643763261647416.gif";

        // Filtrar y formatear items que el usuario realmente tiene (cantidad > 0)
        let itemsList = "";
        const itemKeys = Object.keys(inventario).filter(key => inventario[key] > 0);

        if (itemKeys.length === 0) {
            itemsList = "✨ *La mochila está vacía... por ahora.*";
        } else {
            itemKeys.forEach(key => {
                const itemInfo = shopData[key];
                const nombre = itemInfo ? itemInfo.name : key;
                const emoji = itemInfo ? itemInfo.icon : "📦";
                itemsList += `${emoji} **${nombre}** — \`x${inventario[key]}\`\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🎒 Inventario de ${apodo}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setColor(data.profileColor || '#FFB6C1')
            .setThumbnail(invGif)
            .setDescription(`**Dueño/a:** ${apodo}\n\n**Contenido:**\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${itemsList}\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Inventory 🌸`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};