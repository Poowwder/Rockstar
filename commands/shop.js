const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mira los artículos disponibles en la tienda ✨'),

    async execute(interaction) {
        // 1. OBTENER DATOS DEL USUARIO Y APODO
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const member = interaction.guild.members.cache.get(userId);
        const apodo = member?.nickname || interaction.user.username;

        // 2. CARGAR DATOS DE LA TIENDA DESDE EL JSON
        const shopPath = path.join(__dirname, '../data/shop.json');
        let shopData = {};
        if (fs.existsSync(shopPath)) {
            shopData = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        }

        // 3. IMAGEN CUTE PARA LA TIENDA (GIF Pixel Art Shop)
        const shopGif = "https://i.pinimg.com/originals/3d/82/20/3d822003f56360c4a457a627876a4794.gif";

        // 4. CONSTRUIR LISTA DE PRODUCTOS
        let listaProductos = "";
        const items = Object.keys(shopData);

        if (items.length === 0) {
            listaProductos = "*Parece que la tienda está cerrada por mantenimiento...* 🎀";
        } else {
            items.forEach(id => {
                const item = shopData[id];
                listaProductos += `${item.icon || '📦'} **${item.name}** — \`${item.price} 🌸\`\n> *${item.description}*\n\n`;
            });
        }

        // 5. EMBED AESTHETIC
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🛍️ Cliente: ${apodo}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTitle('✨ Tienda Rockstar')
            .setColor(data.profileColor || '#FFB6C1')
            .setThumbnail(shopGif)
            .setDescription(`**¡Bienvenido/a al mercado sakura, ${apodo}!**\n\n**Saldo actual:** \`${data.wallet || 0} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${listaProductos}୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Shopping 🎀`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};