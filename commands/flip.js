const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'flip',
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('🪙 Apuesta tus flores a cara o cruz')
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a apostar').setRequired(true)),

    async execute(input) {
        const user = input.user || input.author;
        const amount = input.options?.getInteger('cantidad') || parseInt(input.content.split(/ +/)[1]);

        let data = await getUserData(user.id);
        if (amount > data.wallet || amount <= 0) return input.reply("❌ No tienes esa cantidad en mano.");

        const win = Math.random() > 0.5;
        if (win) data.wallet += amount; else data.wallet -= amount;
        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setTitle(win ? '✨ ¡Ganaste!' : '😭 ¡Perdiste!')
            .setColor(win ? '#B5EAD7' : '#FF9AA2')
            .setThumbnail(win ? 'https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif' : 'https://i.pinimg.com/originals/f3/f5/63/f3f56363a0336215707a276856037e81.gif')
            .setDescription(`Apostaste \`${amount} 🌸\` y el resultado fue **${win ? 'doble o nada' : 'nada'}**.\n\n╰┈➤ Cartera: \`${data.wallet} 🌸\``);

        return input.reply({ embeds: [embed] });
    }
};