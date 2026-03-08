const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

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
        const targetMember = input.guild.members.cache.get(target.id);
        
        const data = await getUserData(target.id);
        const inventario = data.inventory || [];

        // Lógica para mostrar los items de forma linda
        let listaItems = "";
        if (inventario.length === 0) {
            listaItems = "*Tu mochila está vacía... ¡ve a la boutique!* 🌸";
        } else {
            // Agrupamos items repetidos para que se vea más limpio
            const counts = {};
            inventario.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
            
            listaItems = Object.entries(counts)
                .map(([name, count]) => `╰┈➤ **${name}** x\`${count}\``)
                .join('\n');
        }

        const invEmbed = new EmbedBuilder()
            .setTitle(`🎒 Mochila de ${targetMember.displayName}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif') // Una mochila o bolso cute
            .setDescription(
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                `${listaItems}\n\n` +
                `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
            )
            .setTimestamp()
            .setFooter({ 
                text: `Consultado por: ${input.member.displayName}`, 
                iconURL: (input.user ? input.user.displayAvatarURL() : input.author.displayAvatarURL()) 
            });

        return input.reply({ embeds: [invEmbed] });
    }
};