const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const { getRequiredXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Mira tu nivel y progreso de XP')
        .addUserOption(o => o.setName('usuario').setDescription('Ver rango de otro')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);
        
        const nivel = data.level || 1;
        const xpActual = data.xp || 0;
        const xpNecesaria = getRequiredXP(nivel);
        const tier = (data.premiumType || 'normal').toUpperCase();

        // Barra de progreso (10 bloques)
        const porcentaje = Math.min(Math.floor((xpActual / xpNecesaria) * 10), 10);
        const barra = "🟦".repeat(porcentaje) + "⬛".repeat(10 - porcentaje);

        const embed = new EmbedBuilder()
            .setTitle(`⭐ Rango de ${target.username}`)
            .setColor('#3498db')
            .addFields(
                { name: 'Nivel', value: `\`${nivel}\``, inline: true },
                { name: 'Rango', value: `\`${tier}\``, inline: true },
                { name: 'Progreso', value: `${barra} \`${xpActual} / ${xpNecesaria} XP\``, inline: false }
            )
            .setThumbnail(target.displayAvatarURL());

        return interaction.reply({ embeds: [embed] });
    }
};