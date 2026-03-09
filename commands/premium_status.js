const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

const ICONS = {
    premium: '✨',
    ultra: '💠',
    clock: '⏳',
    benefit: '💎',
    none: '⚪'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium_status')
        .setDescription('Revisa el estado y tiempo restante de tu suscripción Premium'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const sub = data.subscription;

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `Estado de Suscripción`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // --- CASO 1: NO ES PREMIUM O EXPIRÓ ---
        if (!sub || !sub.active || sub.expiresAt < Date.now()) {
            embed.setTitle(`${ICONS.none} Sin suscripción activa`)
                .setColor('#95a5a6')
                .setDescription('Actualmente no disfrutas de los beneficios Premium.')
                .addFields({ 
                    name: '🚀 ¿Por qué ser Premium?', 
                    value: '• **Sin cooldowns** en `/mine` y `/fish`.\n• Reparaciones **60% más baratas**.\n• Recompensas diarias hasta **x6**.\n• Menor riesgo de rotura de herramientas.'
                })
                .setFooter({ text: 'Usa /subscribe para ver los planes.' });
            
            return interaction.reply({ embeds: [embed] });
        }

        // --- CASO 2: ES PREMIUM ACTIVO ---
        const timeLeft = sub.expiresAt - Date.now();
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const tierName = sub.tier === 'ultra' ? 'ULTRA' : 'PRO';
        const tierIcon = sub.tier === 'ultra' ? ICONS.ultra : ICONS.premium;
        const multiplier = sub.tier === 'ultra' ? 'x8' : 'x5';

        embed.setTitle(`${tierIcon} Suscripción ${tierName} Activa`)
            .setColor(sub.tier === 'ultra' ? '#a333ff' : '#f1c40f')
            .setDescription(`¡Gracias por apoyar al servidor! Tus beneficios actuales son:`)
            .addFields(
                { 
                    name: `${ICONS.clock} Tiempo Restante`, 
                    value: `\`${days} días y ${hours} horas\``, 
                    inline: false 
                },
                { 
                    name: `${ICONS.benefit} Ventajas Activas`, 
                    value: `• Multiplicador de Dinero: **${multiplier}**\n• Cooldowns: **Desactivados**\n• Riesgo de Rotura: **Mínimo**\n• Botón de Tienda en Inventario: **Desbloqueado**`,
                    inline: false 
                }
            )
            .setFooter({ text: 'Tu suscripción es gestionada por el equipo administrativo.' });

        return interaction.reply({ embeds: [embed] });
    }
};