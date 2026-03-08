const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'flip',
    aliases: ['bet', 'apostar', 'coinflip'],
    async execute(message, args) {
        const userId = message.author.id;
        let data = await getUserData(userId);

        // 1. Validar la cantidad apostada
        const apuesta = parseInt(args[0]);

        if (!apuesta || isNaN(apuesta) || apuesta <= 0) {
            return message.reply("🌸 ¡Linda! Dime cuántas flores quieres apostar. Ejemplo: `!!flip 100`.");
        }

        if (data.wallet < apuesta) {
            return message.reply(`😢 No tienes suficientes flores. Tu cartera tiene **${data.wallet}** 🌸.`);
        }

        // 2. Lógica del juego (50/50)
        const victoria = Math.random() > 0.5;
        const resultado = victoria ? "Ganaste" : "Perdiste";
        
        // 3. Actualizar MongoDB
        if (victoria) {
            data.wallet += apuesta;
        } else {
            data.wallet -= apuesta;
        }

        await updateUserData(userId, data);

        // 4. Crear el Embed con diseño Cute
        const embed = new EmbedBuilder()
            .setTitle(victoria ? '✨ ¡Felicidades, ganaste! ✨' : '☁️ Oh no... perdiste ☁️')
            .setDescription(victoria 
                ? `¡La moneda cayó a tu favor! Has ganado **${apuesta}** flores 🌸.` 
                : `La suerte no estuvo de tu lado esta vez. Perdiste **${apuesta}** flores...`)
            .setColor(victoria ? '#FFB6C1' : '#D3D3D3') // Rosa si gana, gris si pierde
            .setThumbnail(victoria 
                ? 'https://i.pinimg.com/originals/30/80/7e/30807e324373467f3c4c95d8d0959089.gif' // Gatito feliz
                : 'https://i.pinimg.com/originals/82/01/9a/82019adb656911f93e9a18017e810a9c.gif') // Personaje triste/lluvia
            .addFields(
                { name: '👛 Tu Cartera Ahora', value: `\`${data.wallet}\` flores`, inline: true }
            )
            .setFooter({ text: '¿Quieres probar tu suerte otra vez? ✨' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};