const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'daily',
    description: 'Reclama tu ofrenda diaria de flores 🌸',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Recibe tu regalo diario de flores 🎁'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        
        // Manejo seguro del apodo (Display Name)
        const member = input.guild ? (input.guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        
        let data = await getUserData(user.id);
        const amount = 2000; // Monto de la recompensa
        const cooldown = 86400000; // 24 horas en milisegundos
        const lastDaily = data.lastDaily || 0;

        // --- ⏳ SISTEMA DE ESPERA (COOLDOWN) ---
        if (cooldown - (Date.now() - lastDaily) > 0) {
            const time = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(time / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            
            const cooldownEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setDescription(`> ⏳ **${member.displayName}**, las sombras exigen paciencia.\n> Tu próxima ofrenda estará disponible en **${hours}h ${minutes}m**.`);
            
            // Responder de forma efímera para no ensuciar el chat
            return input.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }

        // --- 💰 PROCESAR LA TRANSACCIÓN ---
        // Aseguramos que data.wallet sea un número válido
        data.wallet = (data.wallet || 0) + amount;
        data.lastDaily = Date.now();
        await updateUserData(user.id, data);

        // --- 📄 CONSTRUIR EL EMBED ESTÉTICO ---
        const dailyEmbed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/9e/7b/72/9e7b727f7118181283d656f345371690.gif')
            .setDescription(
                `> ✨ **Las sombras te han otorgado tu ofrenda, ${member.displayName}.**\n\n` +
                `╰┈➤ 💰 **Recompensa:** \`${amount.toLocaleString()} 🌸\`\n` +
                `╰┈➤ 🏦 **Nuevo Balance:** \`${data.wallet.toLocaleString()} 🌸\`\n\n` +
                `*Regresa mañana cuando el ciclo se reinicie...*`
            )
            .setTimestamp()
            .setFooter({ 
                text: `Ofrenda de ${member.displayName} ⊹ Economía`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
            });

        return input.reply({ embeds: [dailyEmbed] });
    }
};
