const { EmbedBuilder } = require('discord.js');

// Dificultad: Nivel * 1000
const getRequiredXP = (level) => level * 1000;

async function addXP(userId, amount, interaction, { getUserData, updateUserData }) {
    const data = await getUserData(userId);
    const userTier = data.premiumType || 'normal';

    // Multiplicadores solicitados: Normal x5, Mensual x10, Bimestral x15
    let multiplier = (userTier === 'bimestral') ? 15 : (userTier === 'mensual' ? 10 : 5);
    const finalXP = amount * multiplier;
    
    data.level = data.level || 1;
    data.xp = (data.xp || 0) + finalXP;

    const needed = getRequiredXP(data.level);

    // --- LÓGICA DE SUBIDA DE NIVEL ---
    if (data.xp >= needed) {
        data.level++;
        data.xp = 0; 

        // 1. RECOMPENSA DE DINERO AUTOMÁTICA
        let rewardMoney = 0;
        const isMilestone = data.level % 10 === 0 && data.level <= 100;
        
        if (isMilestone) {
            rewardMoney = data.level * 500; // Ej: Nivel 10 = 5k, Nivel 50 = 25k
            data.wallet = (data.wallet || 0) + rewardMoney;
        } else {
            rewardMoney = data.level * 50; // Recompensa pequeña por niveles normales
            data.wallet = (data.wallet || 0) + rewardMoney;
        }

        // 2. EMBED AESTHETIC PARA EL CANAL
        const user = interaction.user || (interaction.member ? interaction.member.user : null);
        
        const channelEmbed = new EmbedBuilder()
            .setColor(isMilestone ? '#FFD700' : '#FFB6C1')
            .setAuthor({ name: '✨ ¡NIVELES SAKURA! ✨', iconURL: user?.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        if (isMilestone) {
            channelEmbed.setTitle(`🎊 ¡HITO ALCANZADO: NIVEL ${data.level}! 🎊`)
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n🌟 ¡Increíble! <@${userId}> ha llegado a una nueva década.\n💰 **Recompensa de Hito:** \`${rewardMoney} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`);
        } else {
            channelEmbed.setDescription(`*｡☆ ¡Felicidades! <@${userId}> ha subido al **Nivel ${data.level}**.\n🎁 **Premio:** \`${rewardMoney} 🌸\`\n\n*Tu camino hacia la cima continúa... ♡*`);
        }

        if (interaction.channel) {
            interaction.channel.send({ embeds: [channelEmbed] });
        }

        // 3. MENSAJE ESPECIAL AL DM PARA PREMIUM (Solo si no es bot)
        if (userTier !== 'normal' && user) {
            const dmEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('💎 Beneficio Premium: ¡Nivel Up!')
                .setDescription(`¡Hola **${user.username}**! Como usuario **${userTier.toUpperCase()}**, has subido al **Nivel ${data.level}**.\n\n🚀 ¡Tus multiplicadores de XP (**x${multiplier}**) te están haciendo imparable! Gracias por apoyar el servidor.`)
                .setFooter({ text: '🌸 Eres parte de nuestra comunidad VIP' });

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (e) {
                console.log(`No pude enviar DM a ${userId}.`);
            }
        }
    }

    await updateUserData(userId, data);
}

module.exports = { addXP, getRequiredXP };