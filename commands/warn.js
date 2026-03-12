const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Warning } = require('../data/mongodb.js'); // Importamos el modelo
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'warn',
    description: '🚨 Registra una advertencia en los archivos del dominio.',
    async execute(input, args) {
        const isSlash = !!input.user;
        const moderator = isSlash ? input.user : input.author;
        const guild = input.guild;

        if (!input.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return input.reply(`╰┈➤ ❌ Careces de autoridad para dictar veredictos.`);
        }

        const targetUser = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        const reason = isSlash ? input.options.getString('razon') : args?.slice(1).join(' ');

        if (!targetUser || !reason) return input.reply(`╰┈➤ ⚠️ **Uso:** \`!!warn @usuario [razón]\``);
        if (targetUser.bot) return input.reply("╰┈➤ ❌ No puedes advertir a un ente mecánico.");

        // --- 🌑 ARCHIVADO EN MONGODB ---
        const warnID = Date.now().toString(36).toUpperCase();
        await new Warning({
            WarnID: warnID,
            GuildID: guild.id,
            UserID: targetUser.id,
            ModeratorID: moderator.id,
            Reason: reason
        }).save();

        const totalWarns = await Warning.countDocuments({ GuildID: guild.id, UserID: targetUser.id });

        // --- 👁️ AUDITORÍA AUTOMÁTICA ---
        await sendAuditLog(guild, {
            title: '⊹ Nueva Advertencia Registrada ⊹',
            description: 
                `**Sujeto:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
                `**Moderador:** ${moderator.tag}\n` +
                `**Razón:** \`${reason}\`\n` +
                `**ID de Registro:** \`${warnID}\`\n` +
                `**Total en Expediente:** \`${totalWarns}\`\n` +
                `> *El comportamiento ha sido archivado permanentemente.*`,
            color: '#1a1a1a',
            icon: moderator.displayAvatarURL()
        });

        const warnEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ Veredicto de Vigilancia ˚₊‧`)
            .setColor('#1a1a1a')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `👤 **Sujeto:** ${targetUser}\n` +
                `⚖️ **Moderador:** ${moderator.username}\n` +
                `📄 **Razón:** \`${reason}\`\n` +
                `🆔 **ID:** \`${warnID}\`\n` +
                `**─────────────────**\n` +
                `⚠️ **Advertencias Totales:** \`${totalWarns}\``
            )
            .setFooter({ text: `Rockstar ⊹ Nightfall System` });

        return input.reply({ embeds: [warnEmbed] });
    }
};
