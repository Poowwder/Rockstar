const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'use',
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('🎀 Usa o equipa un objeto de tu inventario')
        .addStringOption(opt => opt.setName('item').setDescription('Nombre del item').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const itemName = isSlash ? input.options.getString('item').toLowerCase() : args[0]?.toLowerCase();

        if (!itemName) return input.reply("╰┈➤ 🌸 **¡Holi!** Dime qué quieres usar, linda. ✨");

        let data = await getUserData(user.id);
        const itemIndex = data.inventory.findIndex(i => i.toLowerCase().includes(itemName));

        if (itemIndex === -1) {
            return input.reply(`╰┈➤ ❌ **¡Ups!** No encontré ese objeto en tu mochilita. ✨`);
        }

        const itemReal = data.inventory[itemIndex];

        const useEmbed = new EmbedBuilder()
            .setTitle(`✨ ‧₊˚ Objeto Equipado ˚₊‧ ✨`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
            .setDescription(
                `*“¡Te ves increíble con esto!”* 🎀\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `🌸 **Has equipado:** \`${itemReal}\`\n` +
                `✨ **Estado:** \`Listo para la acción\`\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡A por todas, Rockstar!*`
            )
            .setFooter({ text: `Equipado por: ${user.username} ♡` });

        return input.reply({ embeds: [useEmbed] });
    }
};