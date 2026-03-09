const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js'); 
const emojis = require('../utils/emojiHelper.js');

module.exports = {
    name: 'inv',
    aliases: ['inventario', 'inventory', 'items'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('🎒 Mira los objetos que tienes en tu mochila')
        .addUserOption(option => option.setName('usuario').setDescription('Ver el inventario de otra persona')),

    async execute(input) {
        const isSlash = !!input.user;
        const target = isSlash ? (input.options.getUser('usuario') || input.user) : (input.mentions.users.first() || input.author);
        const targetMember = input.guild.members.cache.get(target.id) || { displayName: target.username };
        
        const data = await getUserData(target.id);
        
        // --- ⚙️ LÓGICA PARA LEER EL OBJETO ---
        const inventario = data.inventory || {}; // Esto es un objeto: { wood: 10, stone: 5 }
        const itemKeys = Object.keys(inventario).filter(key => inventario[key] > 0);

        let listaItems = "";

        if (itemKeys.length === 0) {
            listaItems = "*Tu mochila está vacía... ¡ve a recolectar algo!* 🌸";
        } else {
            // Mapeamos las llaves del objeto para mostrar nombre y cantidad
            listaItems = itemKeys
                .map(key => {
                    // Ponemos la primera letra en mayúscula y reemplazamos guiones bajos
                    const nameNice = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return `╰┈➤ **${nameNice}** x\`${inventario[key]}\``;
                })
                .join('\n');
        }

        const invEmbed = new EmbedBuilder()
            .setTitle(`🎒 Mochila de ${targetMember.displayName}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setDescription(
                `**୨୧ ┈┈┈┈ Contenido ┈┈┈┈ ୨୧**\n\n` +
                `${listaItems}\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            )
            .setTimestamp()
            .setFooter({ 
                text: `Rockstar Inventory ✨`, 
                iconURL: target.displayAvatarURL() 
            });

        return input.reply({ embeds: [invEmbed] });
    }
};