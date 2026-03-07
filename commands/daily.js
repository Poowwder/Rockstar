const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../economyManager.js');

const ICONS = {
    daily: '🎁',
    money: '🌸',
    wood: '🪵',
    streak: '🔥',
    amuleto: '🔰',
    premium: '✨'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria y aumenta tu racha'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const isPremium = data.subscription?.active || false;
        const tier = data.subscription?.tier || 'none';

        // 1. Cooldown de 24 horas (86400 segundos)
        // Nota: Los Premium también tienen daily cada 24h para no romper la economía,
        // pero sus recompensas son mucho mayores.
        const cooldown = checkAndSetCooldown(userId, 'daily_claim', 86400);
        if (cooldown > 0) {
            const hours = Math.floor(cooldown / 3600);
            const minutes = Math.floor((cooldown % 3600) / 60);
            return interaction.reply({ 
                content: `⏰ Ya has reclamado tu regalo. Vuelve en **${hours}h ${minutes}m**.`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 2. Lógica de Racha (Streak)
        const ahora = Date.now();
        const ultimaVez = data.lastDaily || 0;
        const diferenciaHoras = (ahora - ultimaVez) / (1000 * 60 * 60);

        if (diferenciaHoras < 48) {
            // Si reclamó hace menos de 48h (un día de margen), la racha sigue
            data.streak = (data.streak || 0) + 1;
        } else {
            // Si pasó más de 48h, racha rota
            data.streak = 1;
        }
        data.lastDaily = ahora;

        // 3. Multiplicadores Premium
        // Estándar: x1 | Pro: x3 | Ultra: x6
        let multiplier = 1;
        if (isPremium) {
            multiplier = (tier === 'ultra') ? 6 : 3;
        }

        const gainMoney = 5000 * multiplier;
        const gainWood = 10 * multiplier;

        data.wallet += gainMoney;
        data.inventory.madera = (data.inventory.madera || 0) + gainWood;

        // 4. Premio por Racha de 7 días
        let streakBonus = "";
        if (data.streak % 7 === 0) {
            data.inventory.amuleto_proteccion = (data.inventory.amuleto_proteccion || 0) + 1;
            streakBonus = `\n\n${ICONS.streak} **¡BONUS DE SEMANA COMPLETA!**\nRecibiste 1x ${ICONS.amuleto} **Amuleto de Protección**.`;
        }

        await updateUserData(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.daily} Recompensa Diaria - Día ${data.streak}`)
            .setColor(data.streak % 7 === 0 ? '#FFD700' : '#3498db')
            .setDescription(`¡Has recibido tus suministros diarios!${streakBonus}`)
            .addFields(
                { name: `${ICONS.streak} Racha Actual`, value: `\`${data.streak} días\``, inline: true },
                { name: `${ICONS.money} Monedas`, value: `\`+${gainMoney.toLocaleString()}\``, inline: true },
                { name: `${ICONS.wood} Madera`, value: `\`+${gainWood}\``, inline: true }
            )
            .setFooter({ 
                text: isPremium ? `✨ Bonus ${tier.toUpperCase()} activo (x${multiplier})` : 'Tip: Los Premium reciben hasta x6 recompensas.' 
            });

        return interaction.reply({ embeds: [embed] });
    }
};