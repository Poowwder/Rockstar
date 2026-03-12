const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Warning } = require('../data/mongodb.js');

module.exports = {
    name: 'warns',
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('🔍 Accede a los archivos de vigilancia.')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a consultar')),

    async execute(input) {
        const isSlash = !!input.user;
        const targetUser = isSlash ? (input.options.getUser('usuario') || input.user) : (input.mentions.users.first() || input.author);

        const userWarns = await Warning.find({ GuildID: input.guild.id, UserID: targetUser.id }).sort({ Timestamp: -1 });

        const embed = new EmbedBuilder()
            .setTitle(`‧₊˚ Archivos de Vigilancia ˚₊‧`)
            .setColor('#1a1a1a')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Rockstar ⊹ Nightfall System` });

        if (userWarns.length === 0) {
            embed.setDescription(`╰┈➤ **${targetUser.username}** no posee antecedentes en este dominio.`);
        } else {
            const lista = userWarns.map((w, i) => 
                `**${i + 1}.** 🆔 \`${w.WarnID}\`\n╰┈➤ 📄 **Motivo:** ${w.Reason}\n╰┈➤ ⚖️ **Mod:** <@${w.ModeratorID}>`
            ).join('\n\n');

            embed.setDescription(
                `👤 **Sujeto:** ${targetUser}\n` +
                `⚠️ **Infracciones:** \`${userWarns.length}\` \n\n` +
                `**─── ✦ HISTORIAL ✦ ───**\n${lista}`
            );
        }

        return input.reply({ embeds: [embed] });
    }
};
