const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'daily',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Recibe tu regalo diario de flores 🎁'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        
        let data = await getUserData(user.id);
        const amount = 2000; // Puedes cambiar el monto aquí
        const cooldown = 86400000; 
        const lastDaily = data.lastDaily || 0;

        if (cooldown - (Date.now() - lastDaily) > 0) {
            const time = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(time / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            return input.reply(`⏳ **${member.displayName}**, ya recogiste tu regalo. Vuelve en **${hours}h ${minutes}m**.`);
        }

        data.wallet += amount;
        data.lastDaily = Date.now();
        await updateUserData(user.id, data);

        const dailyEmbed = new EmbedBuilder()
            .setTitle('🎁 Regalo Diario Recibido')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/9e/7b/72/9e7b727f7118181283d656f345371690.gif')
            .setDescription(
                `╰┈➤ **¡Holi, ${member.displayName}!**\n\n` +
                `Has recibido tus flores diarias con éxito.\n` +
                `💰 **Recompensa:** \`${amount.toLocaleString()} 🌸\`\n\n` +
                `¡No olvides volver mañana por más! ✨`
            )
            .setTimestamp()
            .setFooter({ text: `Solicitado por: ${member.displayName}`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [dailyEmbed] });
    }
};