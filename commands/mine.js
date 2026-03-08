const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'mine',
    data: new SlashCommandBuilder().setName('mine').setDescription('⛏️ Minería con Zonas VIP'),

    async execute(input) {
        const user = input.user || input.author;
        const member = input.member;
        let data = await getUserData(user.id);

        const tienePico = data.inventory?.some(i => i.toLowerCase().includes('pico'));
        if (!tienePico) return input.reply("╰┈➤ 🌸 **¡Ups!** Necesitas un **Pico** para minar, linda. Búscalo en `!!shop` ✨");

        let boost = 1;
        let zona = "☁️ Mina de Algodón";
        let decor = "🌸";

        if (data.premiumType === 'mensual') { boost = 5; zona = "✨ Cueva de Cuarzo Rosa"; decor = "🎀"; }
        if (data.premiumType === 'bimestral') { boost = 8; zona = "💎 Palacio de Cristal"; decor = "👑"; }

        let gananciaBase = (boost > 1) ? 3000 : 600;
        let gananciaFinal = Math.floor((Math.random() * 500) + gananciaBase) * boost;

        data.wallet += gananciaFinal;
        await updateUserData(user.id, data);

        const mineEmbed = new EmbedBuilder()
            .setTitle(`${decor} ‧₊˚ Minería Rockstar ˚₊‧ ${decor}`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/30/44/8e/30448e64f8992c696e578c7739506691.gif')
            .setDescription(
                `*“Picando piedritas con mucho estilo...”* ⛏️✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `☁️ **Zona:** \`${zona}\`\n` +
                `🎀 **Rango:** \`${data.premiumType || 'Usuario Normal'}\`\n` +
                `🚀 **Boost:** \`x${boost}\` activado\n` +
                `🌸 **Paga:** **${gananciaFinal.toLocaleString()} flores**\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Tus ahorros brillan como diamantes!*`
            )
            .setFooter({ text: `Minera: ${member.displayName} ♡`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        return input.reply({ embeds: [mineEmbed] });
    }
};