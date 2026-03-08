const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const { getRequiredXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra tu nivel y progreso actual ✨')
        .addUserOption(opt => opt.setName('usuario').setDescription('El rango de otro usuario')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);

        const nivel = data.level || 1;
        const xpActual = data.xp || 0;
        const xpNecesaria = getRequiredXP(nivel);
        const apodo = member?.nickname || target.username;

        // --- CÁLCULO DE BARRA DE PROGRESO ---
        const porcentaje = Math.floor((xpActual / xpNecesaria) * 10);
        const barra = "🌸".repeat(porcentaje) + "🤍".repeat(10 - porcentaje);
        const porcTexto = Math.floor((xpActual / xpNecesaria) * 100);

        // GIF Pequeño y Cute para el Rank
        const rankAesthetic = "https://i.pinimg.com/originals/24/0e/43/240e439446d3765f0e9f16182285a73e.gif"; // Estrellitas/Sakura pixel

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `⭐ Rango de ${apodo}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setColor(data.profileColor || '#FFB6C1')
            .setThumbnail(rankAesthetic)
            .setDescription(`**Nivel:** \`${nivel}\`\n**XP:** \`${xpActual} / ${xpNecesaria}\` (\`${porcTexto}%\`)\n\n${barra}`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Ranking`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};