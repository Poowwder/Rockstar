const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const shopData = require('../data/shop.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Mira los tesoros que guardas en tu mochila')
        .addUserOption(opt => opt.setName('usuario').setDescription('El inventario de alguien más')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);
        
        const apodo = member?.nickname || target.username;
        const inventario = data.inventory || {};
        
        // Imagen Aesthetic para la mochila (Un bolso cute o algo estilo anime)
        const bagAesthetic = "https://i.pinimg.com/originals/a1/3e/2e/a13e2e09657685600643763261647416.gif";

        // Filtrar y formatear items
        let itemsList = "";
        const itemKeys = Object.keys(inventario).filter(key => inventario[key] > 0);

        if (itemKeys.length === 0) {
            itemsList = "*Tu mochila está vacía por ahora... ✨*";
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
                name: `🎒 Mochila de ${apodo}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setColor(data.profileColor || '#FFB6C1')
            .setThumbnail(bagAesthetic)
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${itemsList}\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Inventory 🌸`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp(); // <--- Timestamp añadido

        return interaction.reply({ embeds: [embed] });
    }
};