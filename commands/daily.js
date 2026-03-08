const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'daily',
    category: 'economía',
    async execute(message) {
        let data = await getUserData(message.author.id);
        const amount = 1000; // Recompensa fija
        const cooldown = 86400000; // 24 horas en ms
        const lastDaily = data.lastDaily;

        if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
            const time = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(time / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            return message.reply(`⏳ Ya recogiste tu regalo. Vuelve en **${hours}h ${minutes}m**.`);
        }

        data.wallet += amount;
        data.lastDaily = Date.now();
        await updateUserData(message.author.id, data);

        const embed = new EmbedBuilder()
            .setTitle('🎁 Regalo Diario')
            .setDescription(`¡Has recibido **${amount}** flores hoy! ✨\nVuelve mañana por más.`)
            .setColor('#FFB6C1');

        message.reply({ embeds: [embed] });
    }
};