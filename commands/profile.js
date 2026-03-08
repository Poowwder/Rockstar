const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');
const { getRequiredXP } = require('../levelManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Visualiza tu perfil estético')
        .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);

        // 1. --- DATOS DE NIVEL ---
        const nivel = data.level || 1;
        const xpActual = data.xp || 0;
        const xpNecesaria = getRequiredXP(nivel);
        const progreso = Math.min(Math.floor((xpActual / xpNecesaria) * 10), 10);
        const barraSakura = "🌸".repeat(progreso) + "🤍".repeat(10 - progreso);

        // 2. --- PERSONALIZACIÓN VISUAL ---
        const embedColor = data.profileColor || '#FFB6C1'; 
        const apodo = member?.nickname || target.username;
        
        // Imagen Cute Aesthetic (puedes cambiar este link por cualquier GIF/Imagen que te guste)
        const aestheticGift = "https://i.pinimg.com/originals/3d/82/20/3d822003f56360c4a457a627876a4794.gif";

        // 3. --- INFO MATRIMONIO ---
        let infoMatrimonio = "💔 *Soltero/a*";
        if (data.marryId) {
            const pareja = interaction.guild.members.cache.get(data.marryId);
            infoMatrimonio = `💖 **Casado/a con:** \`${pareja ? pareja.user.username : "Alguien especial"}\``;
        }

        // 4. --- CONSTRUCCIÓN DEL EMBED ---
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🌸 Perfil de ${apodo}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setColor(embedColor)
            .setThumbnail(aestheticGift) // Imagen cute a la derecha
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n${infoMatrimonio}\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .addFields(
                { 
                    name: '⭐ Nivel Actual', 
                    value: `\`Level ${nivel}\``, 
                    inline: true 
                },
                { 
                    name: '✨ Experiencia', 
                    value: `\`${xpActual} / ${xpNecesaria} XP\``, 
                    inline: true 
                },
                { 
                    name: '🌸 Progreso hacia el siguiente nivel', 
                    value: `${barraSakura}`, 
                    inline: false 
                }
            )
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Anniversary`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        // Si quieres que la foto del usuario también aparezca, puedes ponerla como Image
        // embed.setImage(target.displayAvatarURL({ dynamic: true, size: 512 }));

        return interaction.reply({ embeds: [embed] });
    }
};