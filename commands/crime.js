const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'crime',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('🕶️ Comete un crimen para ganar flores (¡o perderlas!)'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;

        let data = await getUserData(user.id);
        const now = Date.now();
        const cooldown = 1800000; // 30 minutos de cooldown

        if (now - (data.lastCrime || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (now - data.lastCrime)) / 60000);
            return input.reply({ 
                content: `⏳ **Tranquila, Rockstar...** la policía te está buscando. Espera **${restante} minutos** más.`, 
                ephemeral: true 
            });
        }

        const exito = Math.random() > 0.55; // 45% de probabilidad de éxito (es difícil)
        const embed = new EmbedBuilder().setTimestamp();

        if (exito) {
            const ganancia = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
            const crimenesPositivos = [
                "Hackeaste la cuenta de una multinacional de cosméticos. ✨",
                "Vendiste entradas falsas para un concierto agotado. 🎫",
                "Encontraste una billetera de diseñador tirada y te la quedaste. 👛",
                "Hiciste un grafiti tan artístico que alguien te pagó por no borrarlo. 🎨"
            ];
            const frase = crimenesPositivos[Math.floor(Math.random() * crimenesPositivos.length)];

            data.wallet += ganancia;
            data.lastCrime = now;

            embed.setTitle('🕶️ ¡Crimen Perfecto!')
                .setColor('#B5EAD7') // Verde pastel
                .setThumbnail('https://i.pinimg.com/originals/3d/82/38/3d8238f533bc71536b6680459c3818e6.gif')
                .setDescription(
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                    `**${member.displayName}**, tu plan salió a la perfección.\n\n` +
                    `╰┈➤ **Acción:** ${frase}\n` +
                    `╰┈➤ **Botín:** \`${ganancia.toLocaleString()} 🌸\`\n\n` +
                    `*Eres toda una mente criminal... con estilo.* ✨\n\n` +
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
                );
        } else {
            const multa = 1200;
            const fallos = [
                "Intentaste robar una joyería pero te tropezaste con un estante. 💎",
                "Te atraparon haciendo trampas en el casino clandestino. 🃏",
                "La policía te vio tratando de hackear el cajero. 🚔"
            ];
            const fraseFallo = fallos[Math.floor(Math.random() * fallos.length)];

            data.wallet = Math.max(0, data.wallet - multa);
            data.lastCrime = now;

            embed.setTitle('🚫 ¡A la cárcel!')
                .setColor('#FF9AA2') // Rojo/Rosa pastel
                .setThumbnail('https://i.pinimg.com/originals/5e/54/2e/5e542ef998492040f7d5c95333f21151.gif')
                .setDescription(
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                    `**${member.displayName}**, esta vez no tuviste suerte.\n\n` +
                    `╰┈➤ **Fallo:** ${fraseFallo}\n` +
                    `╰┈➤ **Multa:** \`${multa.toLocaleString()} 🌸\`\n\n` +
                    `*Tal vez deberías dedicarte a algo más honesto hoy.* 😭\n\n` +
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
                );
        }

        await updateUserData(user.id, data);
        return input.reply({ embeds: [embed] });
    }
};