const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'box',
    data: new SlashCommandBuilder().setName('box').setDescription('📦 Abre cajas sorpresa'),

    async execute(input) {
        const user = input.user || input.author;
        const member = input.member;
        let data = await getUserData(user.id);

        let limite = (data.premiumType === 'mensual') ? 2 : (data.premiumType === 'bimestral') ? 3 : 1;

        if ((data.boxesToday || 0) >= limite) {
            return input.reply(`╰┈➤ 🎀 **¡Espera!** Ya abriste tus regalitos de hoy (\`${limite}/${limite}\`). Mañana habrá más ✨`);
        }

        const premios = ["Pico de Cristal 💎", "Caña de Oro 🎣", "Diamante Rosa ✨", "15k Flores 🌸"];
        const premio = premios[Math.floor(Math.random() * premios.length)];

        data.boxesToday = (data.boxesToday || 0) + 1;
        if (!data.inventory) data.inventory = [];
        data.inventory.push(premio);
        await updateUserData(user.id, data);

        const boxEmbed = new EmbedBuilder()
            .setTitle(`🎁 ‧₊˚ Un Regalo para Ti ˚₊‧ 🎁`)
            .setColor('#CDB4DB')
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif')
            .setDescription(
                `*“¿Qué habrá dentro de este lazo?”* 🎀✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `🌸 **Encontraste:** **${premio}**\n` +
                `🎁 **Cajas hoy:** \`${data.boxesToday}/${limite}\`\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Espero que te sea de mucha utilidad!*`
            )
            .setFooter({ text: `Para: ${member.displayName} ♡`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [boxEmbed] });
    }
};