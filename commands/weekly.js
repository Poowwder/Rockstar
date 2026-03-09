const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'weekly',
    async execute(message) {
        let data = await getUserData(message.author.id);
        const cooldown = 7 * 24 * 60 * 60 * 1000;
        const lastWeekly = data.lastWeekly || 0;

        if (Date.now() - lastWeekly < cooldown) {
            const timeLeft = cooldown - (Date.now() - lastWeekly);
            const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
            
            return message.reply(`╰┈➤ 🎀 **¡Paciencia, linda!** Tu regalito semanal estará listo en \`${days} días\`. ✨`);
        }

        let base = 25000; // Un regalo generoso
        let boost = (data.premiumType === 'mensual') ? 5 : (data.premiumType === 'bimestral') ? 8 : 1;
        let total = base * boost;

        data.wallet += total;
        data.lastWeekly = Date.now();
        await updateUserData(message.author.id, data);

        const weeklyEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ 🌸 Tu Regalo Semanal 🌸 ˚₊‧`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif')
            .setDescription(
                `*“Para una Rockstar muy especial...”* ✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `🎁 **Premio:** \`${total.toLocaleString()} flores\`\n` +
                `🚀 **Boost Premium:** \`x${boost}\` activo\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Disfruta tus flores en la boutique!* 🎀`
            )
            .setFooter({ text: `Entregado a: ${message.member.displayName} ♡`, iconURL: message.author.displayAvatarURL() });

        return message.reply({ embeds: [weeklyEmbed] });
    }
};