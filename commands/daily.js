const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'daily',
    aliases: ['diario'],
    async execute(message) {
        const userId = message.author.id;
        const data = await getUserData(userId);

        // Configuración del Daily
        const dailyAmount = 500; // Cantidad de flores que regala
        const cooldown = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        const lastDaily = data.lastDaily || 0;

        // Verificar Cooldown
        if (Date.now() - lastDaily < cooldown) {
            const timeLeft = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return message.reply({
                embeds: [{
                    title: "⏳ ¡Aún no, linda!",
                    description: `Ya has recogido tus flores de hoy. Vuelve en **${hours}h ${minutes}m** para más. ✨`,
                    color: 0xFFB6C1
                }]
            });
        }

        // --- PROCESAR PREMIO ---
        data.wallet += dailyAmount;
        data.lastDaily = Date.now(); // Guardamos el momento exacto en que lo usó

        await updateUserData(userId, data);

        // --- EMBED AESTHETIC ---
        const embed = new EmbedBuilder()
            .setTitle('🌸 Regalo Diario')
            .setDescription(`¡Qué alegría verte de nuevo! Aquí tienes tus **${dailyAmount}** flores de hoy. \n\n✨ *¡Sigue coleccionando cosas lindas!*`)
            .setColor('#FFB6C1')
            // Thumbnail de un gatito o personaje cute recibiendo un regalo
            .setThumbnail('https://i.pinimg.com/originals/30/80/7e/30807e324373467f3c4c95d8d0959089.gif') 
            .addFields({ name: '👛 Cartera Actual', value: `\`${data.wallet}\` flores` })
            .setFooter({ text: 'Vuelve mañana para más flores' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};