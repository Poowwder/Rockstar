const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria de flores'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const member = interaction.guild.members.cache.get(userId);
        
        const now = Date.now();
        const cooldown = 86400000; // 24 horas en milisegundos
        const lastDaily = data.lastDaily || 0;

        const apodo = member?.nickname || interaction.user.username;
        const embedColor = data.profileColor || '#FFB6C1';
        
        // GIF Aesthetic de un regalo o flores (Sakura Style)
        const dailyGiftAesthetic = "https://i.pinimg.com/originals/de/21/e4/de21e4286663f9a76479f6e1e7f62e6e.gif";

        if (now - lastDaily < cooldown) {
            const tiempoRestante = cooldown - (now - lastDaily);
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));

            const embedError = new EmbedBuilder()
                .setAuthor({ 
                    name: `⏳ ¡Casi, ${apodo}!`, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                })
                .setColor('#FF6B6B')
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\nYa has recogido tus flores hoy. Vuelve en **${horas}h y ${minutos}m**.\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
                .setFooter({ 
                    text: `${interaction.guild.name} • Espera un poquito 🎀`, 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) 
                });

            return interaction.reply({ embeds: [embedError] });
        }

        // Recompensa aleatoria entre 1000 y 2500 flores
        const recompensa = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;
        
        data.wallet += recompensa;
        data.lastDaily = now;
        await updateUserData(userId, data);

        const embedSuccess = new EmbedBuilder()
            .setAuthor({ 
                name: `🌸 Recompensa para ${apodo}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTitle('✨ ¡Regalo Diario Recogido!')
            .setThumbnail(dailyGiftAesthetic)
            .setColor(embedColor)
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\nHas recibido **${recompensa} 🌸** flores frescas.\n¡Gracias por visitarnos hoy!\n\n**Nuevo Saldo:** \`${data.wallet} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Rewards 🎁`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embedSuccess] });
    }
};