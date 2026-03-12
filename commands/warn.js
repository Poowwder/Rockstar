const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Logger maestro

const warningsPath = path.join(__dirname, '../data/warnings.json');

// --- 🌑 EMOJIS OSCUROS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '🌑';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🌑';
};

module.exports = {
    name: 'warn',
    description: '🚨 Registra una advertencia en el expediente de un sujeto.',
    category: 'moderación',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('🚨 Advierte a un usuario')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a advertir').setRequired(true))
        .addStringOption(opt => opt.setName('razon').setDescription('Motivo de la advertencia').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const moderator = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);

        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!isSlash && !input.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return input.reply(`╰┈➤ ❌ Careces de autoridad para dictar veredictos.`);
        }

        const targetUser = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        const reason = isSlash ? input.options.getString('razon') : args?.slice(1).join(' ');

        if (!targetUser || !reason) {
            return input.reply(`╰┈➤ ⚠️ **Uso correcto:** \`!!warn @usuario [razón]\``);
        }

        if (targetUser.bot) return input.reply("╰┈➤ ❌ No puedes advertir a un ente mecánico.");

        // --- 📂 GESTIÓN DE EXPEDIENTES (JSON) ---
        if (!fs.existsSync(path.dirname(warningsPath))) fs.mkdirSync(path.dirname(warningsPath), { recursive: true });
        if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, JSON.stringify({}, null, 2));

        let warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        
        if (!warns[guild.id]) warns[guild.id] = {};
        if (!warns[guild.id][targetUser.id]) warns[guild.id][targetUser.id] = [];

        const warnEntry = {
            id: Date.now().toString(36),
            reason: reason,
            moderator: moderator.id,
            date: new Date().toLocaleString()
        };

        warns[guild.id][targetUser.id].push(warnEntry);
        fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));

        const totalWarns = warns[guild.id][targetUser.id].length;

        // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
        await sendAuditLog(guild, {
            title: '⊹ Nueva Advertencia Registrada ⊹',
            description: 
                `**Sujeto:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
                `**Moderador:** ${moderator.tag}\n` +
                `**Razón:** \`${reason}\`\n` +
                `**ID de Registro:** \`${warnEntry.id}\`\n` +
                `**Total en Expediente:** \`${totalWarns}\`\n` +
                `> *El comportamiento ha sido archivado en las sombras.*`,
            color: '#1a1a1a',
            icon: moderator.displayAvatarURL()
        });

        // --- 📄 PRESENTACIÓN ROCKSTAR ---
        const warnEmbed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ Veredicto de Vigilancia ˚₊‧ ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif')
            .setDescription(
                `*“Tus actos han dejado una huella en el registro...”*\n\n` +
                `**─── ✦ DETALLES ✦ ───**\n` +
                `👤 **Sujeto:** ${targetUser}\n` +
                `⚖️ **Moderador:** ${moderator.username}\n` +
                `📄 **Razón:** \`${reason}\`\n` +
                `**─────────────────**\n` +
                `⚠️ **Advertencias Totales:** \`${totalWarns}\``
            )
            .setFooter({ text: `Rockstar ⊹ Vigilance System`, iconURL: guild.iconURL() })
            .setTimestamp();

        // Avisar al usuario por MD
        try {
            await targetUser.send({ 
                content: `╰┈➤ 🌑 **Notificación de Vigilancia:** Has sido advertido en **${guild.name}**.\n**Motivo:** \`${reason}\`\n*Tu expediente ahora cuenta con ${totalWarns} advertencias.*`
            });
        } catch (err) {
            console.log(`No se pudo enviar MD a ${targetUser.tag}`);
        }

        return input.reply({ embeds: [warnEmbed] });
    }
};
