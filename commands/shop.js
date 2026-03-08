const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const shopData = require('../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mira los artículos disponibles en la tienda'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const member = interaction.guild.members.cache.get(userId);
        
        const apodo = member?.nickname || interaction.user.username;
        const embedColor = data.profileColor || '#FFB6C1';
        
        // Imagen Aesthetic de una tienda Cute / Pixel Art
        const shopAesthetic = "https://i.pinimg.com/originals/94/f9/0b/94f90b9b3f3a8b4b7b2b8d0a4f5f5f5f.gif";

        // Construir la lista de productos
        let listaProductos = "";
        for (const id in shopData) {
            const item = shopData[id];
            // Solo mostramos items que tengan un precio mayor a 0 (para ocultar cajas diarias gratis si quieres)
            if (item.price > 0) {
                listaProductos += `${item.icon} **${item.name}** — \`${item.price} 🌸\`\n*${item.description}*\n\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🛍️ Cliente: ${apodo}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTitle('✨ Tienda Rockstar') // Título mantenido con emoji nuevo
            .setThumbnail(shopAesthetic)
            .setColor(embedColor)
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${listaProductos}୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .addFields({ 
                name: '💰 Tu Saldo', 
                value: `\`${data.wallet || 0} 🌸\` en cartera`, 
                inline: false 
            })
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Shopping 🎀`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};