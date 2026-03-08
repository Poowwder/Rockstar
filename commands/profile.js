const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'profile',
    aliases: ['perfil', 'p'],
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(target.id); // Para obtener el apodo
        const data = await getUserData(target.id);

        if (!data) return message.reply("❌ No se pudieron cargar los datos.");

        // Lógica de Mascotas
        let pets = [];
        if (data.inventory?.has("Mapache Curioso 🦝")) pets.push("🦝"); else pets.push("🔒");
        if (data.inventory?.has("Zorro Maestro 🦊")) pets.push("🦊"); else pets.push("🔒");
        if (data.inventory?.has("Búho Erudito 🦉")) pets.push("🦉"); else pets.push("🔒");
        
        if (data.premiumType === 'mensual' || data.premiumType === 'bimestral') pets.push("🦄"); else pets.push("❌");
        if (data.premiumType === 'bimestral') pets.push("🐲"); else pets.push("❌");

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `✨ Perfil de ${member.displayName}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setColor('#FFB6C1')
            // Thumbnail de una chica/personaje anime aesthetic descansando
            .setThumbnail('https://i.pinimg.com/originals/60/0b/11/600b1154503781033700140e6086705d.gif')
            .addFields(
                { name: '⭐ Progreso', value: `📈 **Nivel:** \`${data.level}\` \n✨ **XP:** \`${data.xp.toLocaleString()}\``, inline: true },
                { name: '📊 Actividad', value: `💬 **Msgs:** \`${data.messageCount.toLocaleString()}\` \n🎭 **Reac:** \`${data.reactionCount.toLocaleString()}\``, inline: true },
                { name: '🐾 Colección de Mascotas', value: `> ${pets.join("  ")}`, inline: false }
            )
            .setFooter({ text: `Estatus: ${data.premiumType.toUpperCase()}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};