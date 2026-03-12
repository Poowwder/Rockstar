const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '../data/warnings.json');

// --- 🌑 EMOJIS OSCUROS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '🌑';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🌑';
};

module.exports = {
    name: 'warns',
    description: '🔍 Revisa el historial de advertencias de un usuario.',
    category: 'moderación',
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('🔍 Revisa el historial de advertencias')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a consultar')),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);

        // 1. Determinar el objetivo (mencionado o el mismo autor)
        const targetUser = isSlash 
            ? (input.options.getUser('usuario') || user) 
            : (input.mentions.users.first() || user);

        // 2. Leer base de datos
        if (!fs.existsSync(warningsPath)) {
            return input.reply(`╰┈➤ ${e()} El registro de las sombras aún no ha sido escrito.`);
        }

        let warns = {};
        try {
            warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        } catch (err) {
            warns = {};
        }

        const userWarns = warns[guild.id]?.[targetUser.id] || [];

        // --- 📄 PRESENTACIÓN ROCKSTAR ---
        const embed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ Archivos de Vigilancia ˚₊‧ ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Expediente consultado por: ${user.username} ⊹ Rockstar Nightfall` });

        if (userWarns.length === 0) {
            embed.setDescription(`> *“Su alma parece estar limpia... por ahora.”*\n\n╰┈➤ **${targetUser.username}** no posee antecedentes en este dominio.`);
        } else {
            // Mapeamos los warns con un formato Rockstar limpio
            const listaWarns = userWarns.map((w, i) => {
                return `**${i + 1}.** 🆔 \`${w.id}\`\n╰┈➤ 📄 **Motivo:** ${w.reason}\n╰┈➤ ⚖️ **Mod:** <@${w.moderator}>\n╰┈➤ 📅 **Fecha:** \`${w.date}\``;
            }).join('\n\n');

            embed.setDescription(
                `> *“Las sombras no olvidan los errores cometidos.”*\n\n` +
                `👤 **Usuario:** ${targetUser}\n` +
                `⚠️ **Total de Infracciones:** \`${userWarns.length}\` \n\n` +
                `**─── ✦ HISTORIAL ✦ ───**\n` +
                listaWarns +
                `\n**─────────────────**`
            );
        }

        return input.reply({ embeds: [embed] });
    }
};

        return input.reply({ embeds: [embed] });
    }
};
