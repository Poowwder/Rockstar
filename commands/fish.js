const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'fish',
    data: new SlashCommandBuilder().setName('fish').setDescription('🎣 Pesca en Zonas Secretas'),

    async execute(input) {
        const user = input.user || input.author;
        const member = input.member;
        let data = await getUserData(user.id);

        const tieneCaña = data.inventory?.some(i => i.toLowerCase().includes('caña'));
        if (!tieneCaña) return input.reply("╰┈➤ 🌊 **¡Oh no!** No tienes una **Caña**. ¡Consigue una en `!!shop`! ✨");

        let boost = 1;
        let zona = "🛶 Lago de Malvavisco";
        if (data.premiumType === 'mensual') { boost = 5; zona = "🌊 Arrecife de Perlas"; }
        if (data.premiumType === 'bimestral') { boost = 8; zona = "🧜‍♀️ Reino de las Sirenas"; }

        let gananciaBase = (boost > 1) ? 3500 : 700;
        let gananciaFinal = Math.floor((Math.random() * 500) + gananciaBase) * boost;

        data.wallet += gananciaFinal;
        await updateUserData(user.id, data);

        const fishEmbed = new EmbedBuilder()
            .setTitle(`🫧 ‧₊˚ Pesca Estelar ˚₊‧ 🫧`)
            .setColor('#B2E2F2')
            .setThumbnail('https://i.pinimg.com/originals/81/44/7b/81447bc9546059632890b0d61ca55913.gif')
            .setDescription(
                `*“El agua está perfecta hoy...”* 🎣✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `🫧 **Lugar:** \`${zona}\`\n` +
                `🚀 **Multiplicador:** \`x${boost}\` activo\n` +
                `🌸 **Venta:** **${gananciaFinal.toLocaleString()} flores**\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Atrapaste un pez muy brillante!*`
            )
            .setFooter({ text: `Pescadora: ${member.displayName} ♡`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        return input.reply({ embeds: [fishEmbed] });
    }
};