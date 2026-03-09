const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'repair',
    data: new SlashCommandBuilder()
        .setName('repair')
        .setDescription('🛠️ Repara tus herramientas desgastadas'),

    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);

        // Costo base de reparación
        let costo = 5000;
        
        // Beneficio Premium: Descuento en reparaciones
        if (data.premiumType === 'mensual') costo = 2500;
        if (data.premiumType === 'bimestral') costo = 1000;

        if (data.wallet < costo) {
            return input.reply(`╰┈➤ ❌ **Lo siento, linda.** Necesitas \`${costo} flores\` para reparar esto. 🌸`);
        }

        data.wallet -= costo;
        await updateUserData(user.id, data);

        const repairEmbed = new EmbedBuilder()
            .setTitle(`🛠️ ‧₊˚ Taller de Reparación ˚₊‧ 🛠️`)
            .setColor('#B2E2F2') // Celeste pastel
            .setThumbnail('https://i.pinimg.com/originals/6d/6d/0a/6d6d0a7a37936a2818619623c21a147a.gif')
            .setDescription(
                `*“¡Como nuevo y listo para brillar!”* ✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `🌸 **Costo:** \`${costo.toLocaleString()} flores\`\n` +
                `🔧 **Estado:** \`Reparado al 100%\`\n` +
                `🎀 **Rango:** \`${data.premiumType || 'Normal'}\`\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Tus herramientas vuelven a brillar!*`
            )
            .setFooter({ text: `Cliente: ${user.username} ♡` });

        return input.reply({ embeds: [repairEmbed] });
    }
};