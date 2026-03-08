const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const { getRequiredXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra tu perfil Sakura')
        .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);

        // 1. DETERMINAR COLOR (Prioridad: Tinte > Rosa Default)
        const embedColor = data.profileColor || '#FFB6C1'; 
        
        // 2. BADGES DE RANGO
        let badge = '🌸 Usuario Estándar';
        if (data.premiumType === 'mensual') badge = '💎 Miembro Premium';
        if (data.premiumType === 'bimestral') badge = '👑 Miembro de Élite';

        // 3. BARRA DE CARGA SAKURA
        const nivel = data.level || 1;
        const xpActual = data.xp || 0;
        const xpNecesaria = getRequiredXP(nivel);
        const progreso = Math.min(Math.floor((xpActual / xpNecesaria) * 10), 10);
        const barraSakura = "🌸".repeat(progreso) + "🤍".repeat(10 - progreso);

        // 4. INFO MATRIMONIO
        let infoMatrimonio = "💔 *Soltero/a*";
        if (data.marryId) {
            const pareja = interaction.guild.members.cache.get(data.marryId);
            const nombrePareja = pareja ? pareja.user.username : "Alguien especial";
            infoMatrimonio = `💖 **Casado/a con:** \`${nombrePareja}\``;
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Perfil de ${target.username}`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setTitle(badge)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(embedColor)
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n${infoMatrimonio}\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .addFields(
                { 
                    name: '⭐ Nivel y Progreso', 
                    value: `**Nivel:** \`${nivel}\`\n**XP:** \`${xpActual} / ${xpNecesaria}\`\n${barraSakura}`, 
                    inline: false 
                },
                { 
                    name: '💰 Economía', 
                    value: `**Cartera:** \`${data.wallet || 0} 🌸\`\n**Banco:** \`${data.bank || 0} 🌸\``, 
                    inline: true 
                },
                { 
                    name: '🎒 Mochila', 
                    value: `\`${Object.keys(data.inventory || {}).length} objetos\``, 
                    inline: true 
                }
            )
            .setFooter({ text: `Rockstar Anniversary Edition 🌸 • Color: ${embedColor}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};