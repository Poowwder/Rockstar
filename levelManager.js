const { EmbedBuilder } = require('discord.js');
const { grantNeko } = require('./userManager.js'); // Importamos la función del Neko 🐾

async function addXP(userId, amount, message, { getUserData, updateUserData }) {
    let data = await getUserData(userId);
    
    // Boosts según rango Premium (x5 mensual, x8 bimestral)
    let boost = 1;
    if (data.premiumType === 'mensual') boost = 5;
    if (data.premiumType === 'bimestral') boost = 8;
    
    const xpGanada = amount * boost;
    data.xp = (data.xp || 0) + xpGanada;
    
    const nextLevelXP = (data.level || 1) * 500; // Cada nivel pide 500 XP más

    if (data.xp >= nextLevelXP) {
        data.level = (data.level || 1) + 1;
        data.xp = 0; // Reiniciamos XP para el nuevo nivel

        // --- 🌑 LÓGICA DE NYX (Nivel 10) ---
        if (data.level === 10) {
            // Le damos el Neko con su respectivo DM
            await grantNeko(userId, 'nyx', message.client);
        }

        const member = message.guild.members.cache.get(userId);
        const name = member ? member.displayName : "Estrella";

        const levelUpEmbed = new EmbedBuilder()
            .setTitle('✨ ‧₊˚ ¡Nivel Alcanzado! ˚₊‧ ✨')
            .setColor('#CDB4DB') 
            .setThumbnail('https://i.pinimg.com/originals/11/be/f3/11bef32f170ef563391786c5f782c58a.gif')
            .setDescription(
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `**¡Felicidades, ${name}!**\n` +
                `Has brillado tanto que subiste de nivel.\n\n` +
                `╰┈➤ Nuevo Nivel: **${data.level}** 🎀\n` +
                `╰┈➤ Boost Activo: \`x${boost}\` 🚀\n\n` +
                (data.level === 10 ? `✨ **¡Has atraído la atención de Nyx! Mira tu DM...** 🌑\n\n` : "") +
                `*¡Sigue así, toda una Rockstar!*\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧`
            );

        message.channel.send({ content: `<@${userId}>`, embeds: [levelUpEmbed] });
    }

    await updateUserData(userId, data);
}

module.exports = { addXP };