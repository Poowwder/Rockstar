const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Apuesta tus flores en la máquina tragamonedas')
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad de flores a apostar').setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const apuesta = interaction.options.getInteger('cantidad');
        const data = await getUserData(userId);

        // 1. Validaciones
        if (apuesta <= 0) return interaction.reply("❌ La apuesta debe ser mayor a 0.");
        if (data.wallet < apuesta) return interaction.reply(`❌ No tienes suficientes flores. Tienes **${data.wallet} 🌸**.`);
        if (apuesta > 5000) return interaction.reply("❌ La apuesta máxima en la máquina es de **5000 🌸**.");

        // 2. Configuración de la máquina
        const simbolos = ['🍒', '🍋', '🍇', '🔔', '💎', '🌸'];
        const ranura1 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const ranura2 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const ranura3 = simbolos[Math.floor(Math.random() * simbolos.length)];

        const resultado = `[ ${ranura1} | ${ranura2} | ${ranura3} ]`;
        let multiplicador = 0;
        let mensaje = "";

        // 3. Lógica de premios
        if (ranura1 === ranura2 && ranura2 === ranura3) {
            // Triple coincidencia (Jackpot)
            if (ranura1 === '🌸') multiplicador = 10; // Jackpot Máximo
            else if (ranura1 === '💎') multiplicador = 7;
            else multiplicador = 5;
            mensaje = "🎊 ¡JACKPOT! ¡Has ganado un premio enorme! 🎊";
        } 
        else if (ranura1 === ranura2 || ranura2 === ranura3 || ranura1 === ranura3) {
            // Doble coincidencia
            multiplicador = 2;
            mensaje = "✨ ¡Nada mal! Has duplicado tu apuesta. ✨";
        } 
        else {
            // Perdió
            multiplicador = 0;
            mensaje = "😔 La suerte no estuvo de tu lado esta vez...";
        }

        // 4. Actualizar economía
        const ganancias = apuesta * multiplicador;
        if (multiplicador > 0) {
            data.wallet += (ganancias - apuesta); // Sumamos el neto ganado
        } else {
            data.wallet -= apuesta;
        }

        await updateUserData(userId, data);

        // 5. Embed Aesthetic
        const embed = new EmbedBuilder()
            .setTitle('🎰 Máquina de Flores')
            .setColor(multiplicador > 0 ? '#f1c40f' : '#e74c3c')
            .setDescription(`**${interaction.user.username}** tiró de la palanca...\n\n` +
                            `> \`|———————|\`\n` +
                            `> \`| ${resultado} |\`\n` +
                            `> \`|———————|\`\n\n` +
                            `${mensaje}`)
            .addFields(
                { name: 'Apuesta', value: `${apuesta} 🌸`, inline: true },
                { name: 'Resultado', value: multiplicador > 0 ? `+${ganancias} 🌸` : `-${apuesta} 🌸`, inline: true }
            )
            .setFooter({ text: `Saldo actual: ${data.wallet} 🌸` });

        return interaction.reply({ embeds: [embed] });
    }
};