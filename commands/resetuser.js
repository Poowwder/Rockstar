const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateUserData } = require('../userManager.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'resetuser',
    data: new SlashCommandBuilder()
        .setName('resetuser')
        .setDescription('🧹 Erradica y reinicia los registros de un usuario.')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a purificar').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(input) {
        // --- 🛡️ VALIDACIÓN DE AUTORIDAD ---
        if (!input.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return input.reply({ content: "╰┈➤ ❌ Careces de la autoridad necesaria para alterar los archivos del sistema.", ephemeral: true });
        }

        const isSlash = !!input.user;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();

        if (!target) return input.reply("╰┈➤ ⚠️ Identifica al sujeto cuyos registros serán erradicados.");

        // --- 📂 PROTOCOLO DE REINICIO (DATOS PURIFICADOS) ---
        const newData = {
            userId: target.id,
            wallet: 0,
            bank: 0,
            level: 1,
            xp: 0,
            inventory: [],
            premiumType: 'normal'
        };

        try {
            await updateUserData(target.id, newData);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(input.guild, {
                title: '⊹ Erradicación de Registros ⊹',
                description: 
                    `**Sujeto:** ${target.tag} (\`${target.id}\`)\n` +
                    `**Administrador:** ${isSlash ? input.user.tag : input.author.tag}\n` +
                    `**Acción:** Reinicio total de economía y niveles.\n` +
                    `> *Todos los datos han sido purgados y devueltos a su estado original.*`,
                thumbnail: target.displayAvatarURL({ dynamic: true }),
                color: '#1a1a1a',
                icon: (isSlash ? input.user : input.author).displayAvatarURL()
            });

            // --- 📄 RESPUESTA ESTÉTICA ---
            const resetEmbed = new EmbedBuilder()
                .setTitle(`⊹ Protocolo de Purificación ⊹`)
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/a0/6c/4a/a06c4a93883a908a8e32918f0f09a18d.gif') // GIF de limpieza oscura
                .setDescription(
                    `*“Los archivos han sido consumidos por el vacío. Un nuevo comienzo ha sido forzado.”*\n\n` +
                    `**─── ✦ DETALLES ✦ ───**\n` +
                    `👤 **Usuario:** \`${target.username}\`\n` +
                    `🌑 **Estado:** \`Registros Erradicados\`\n` +
                    `✅ **Base de Datos:** \`Sincronizada\`\n` +
                    `**─────────────────**\n\n` +
                    `╰┈➤ *El historial del sujeto ha dejado de existir.*`
                )
                .setFooter({ text: `Rockstar ⊹ Vigilance System`, iconURL: input.guild.iconURL() })
                .setTimestamp();

            return input.reply({ embeds: [resetEmbed] });

        } catch (error) {
            console.error("Error en resetuser:", error);
            return input.reply("╰┈➤ ❌ Error crítico al intentar purgar los datos de la base de datos.");
        }
    }
};
