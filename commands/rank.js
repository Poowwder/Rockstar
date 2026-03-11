const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');
const { UserProfile } = require('../data/mongodb.js'); 
const { checkNekos } = require('../functions/checkNekos.js');

// --- ✨ EMOJIS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'rank',
    aliases: ['lvl', 'nivel'],
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('📊 Revisa tu nivel de experiencia en las sombras')
        .addUserOption(opt => opt.setName('usuario').setDescription('Ver el nivel de otra persona')),

    async execute(input) {
        // --- ⊹ DETECCIÓN HÍBRIDA ⊹ ---
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const target = isSlash ? (input.options.getUser('usuario') || author) : (input.mentions.users.first() || author);
        const guild = input.guild;

        const member = guild ? (guild.members.cache.get(target.id) || { displayName: target.username }) : { displayName: target.username };
        const rndEmj = getRndEmoji(guild);
        
        const data = await getUserData(target.id);

        const currentLevel = data.level || 1;
        const currentXP = data.xp || 0;
        const nextLevelXP = currentLevel * 500;
        const percent = Math.min(Math.floor((currentXP / nextLevelXP) * 100), 100);

        // --- 🐱 Sincronización con el sistema de Nekos (Nyx) ---
        try {
            await UserProfile.findOneAndUpdate(
                { UserID: target.id, GuildID: guild.id },
                { Level: currentLevel },
                { upsert: true }
            );

            // Verificamos si desbloqueó a Nyx (solo si es el propio usuario viéndose a sí mismo)
            if (target.id === author.id && checkNekos) {
                await checkNekos(input, 'levelUp');
            }
        } catch (e) {
            console.error("Error sincronizando Nekos en el Rank:", e);
        }

        // --- 📊 BARRA DE PROGRESO ROCKSTAR ---
        const filled = Math.floor(percent / 10);
        const progress = "🌸".repeat(filled) + "🖤".repeat(10 - filled);

        const rankEmbed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                `> ${rndEmj} **Nivel de Prestigio: ${member.displayName}**\n` +
                `> *“La experiencia se forja en la oscuridad...”*\n\n` +
                `╰┈➤ 💠 **Nivel:** \`${currentLevel}\`\n` +
                `╰┈➤ ✨ **Experiencia:** \`${currentXP.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP\`\n` +
                `╰┈➤ 📊 **Progreso:** \`${percent}%\`\n\n` +
                `**Avance hacia el Nivel ${currentLevel + 1}**\n` +
                `> ${progress}`
            )
            .setFooter({ text: `Sistema de Niveles ⊹ Rockstar`, iconURL: target.displayAvatarURL() });

        return input.reply({ embeds: [rankEmbed] });
    }
};
