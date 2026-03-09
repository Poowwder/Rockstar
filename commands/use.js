const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'use',
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('🎀 Usa o equipa un objeto de tu inventario')
        .addStringOption(opt => opt.setName('item').setDescription('Nombre del item').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const itemName = isSlash ? input.options.getString('item').toLowerCase() : args?.join(' ').toLowerCase();

        if (!itemName) return input.reply("╰┈➤ 🌸 **¡Hola!** Dime qué quieres usar. ✨");

        let data = await getUserData(user.id);
        
        // Buscamos el item en el inventario
        const itemIndex = data.inventory.findIndex(i => i.toLowerCase().includes(itemName));

        if (itemIndex === -1) {
            return input.reply(`╰┈➤ ❌ **¡Ups!** No encontré ese objeto en tu mochila. ✨`);
        }

        const itemReal = data.inventory[itemIndex];
        let mensajeExtra = `*“¡Te ves increíble con esto!”* 🎀`;
        let estadoItem = `Listo para la acción`;

        // --- ❤️ LÓGICA ESPECIAL PARA EL ITEM "VIDA" ---
        if (itemReal.toLowerCase().includes("vida")) {
            // Regla: No se puede usar si tiene más de 2.0 (Bimestrales deben perder 1 completa)
            if (data.health > 2.0) {
                return input.reply(`╰┈➤ 🩺 **¡Espera!** Tu salud está en \`${data.health.toFixed(1)}/3\`. Solo puedes usar una vida cuando tengas \`2.0\` o menos. ✨`);
            }

            // Consumimos el item y curamos
            data.inventory.splice(itemIndex, 1);
            data.health = Math.min(3, data.health + 1);
            
            await updateUserData(user.id, { health: data.health, inventory: data.inventory });
            
            mensajeExtra = `*“¡Te sientes con mucha más energía!”* 💖`;
            estadoItem = `Salud restaurada a ${data.health.toFixed(1)}/3`;
        }

        const useEmbed = new EmbedBuilder()
            .setTitle(`✨ ‧₊˚ Objeto Utilizado ˚₊‧ ✨`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
            .setDescription(
                `${mensajeExtra}\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n` +
                `🌸 **Has usado:** \`${itemReal}\`\n` +
                `✨ **Estado:** \`${estadoItem}\`\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**\n\n` +
                `╰┈➤ *¡A por todas, Rockstar!*`
            )
            .setFooter({ text: `Acción por: ${user.username} ♡`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [useEmbed] });
    }
};