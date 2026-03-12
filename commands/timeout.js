const ms = require('ms');
const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conectamos los logs

module.exports = {
    name: 'timeout',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para exiliar a alguien en las sombras.');
        }

        const member = message.mentions.members.first();
        const time = args[1]; // El tiempo es el segundo argumento (después de la mención)

        if (!member || !time) {
            return message.reply('╰┈➤ ⚠️ Uso correcto: `!!timeout @usuario 10m` (m = minutos, h = horas, d = días).');
        }

        const duration = ms(time);
        if (!duration) {
            return message.reply('╰┈➤ ❌ Formato de tiempo inválido. Usa m (minutos), h (horas) o d (días).');
        }

        try {
            // --- ⏳ APLICAR TIMEOUT ---
            await member.timeout(duration, `Aislamiento dictado por ${message.author.tag}`);
            message.reply(`╰┈➤ 🌑 **${member.user.tag}** ha sido aislado en las sombras por **${time}**.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Aislamiento Temporal (Timeout) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Usuario Aislado:** ${member.user.tag} (\`${member.id}\`)\n` +
                            `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `**Duración:** \`${time}\`\n` +
                            `> *Su voz ha sido arrebatada temporalmente.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error en timeout:", error);
            message.reply('╰┈➤ ❌ Las sombras rechazaron tu mandato. Revisa que mi rol sea superior al del usuario.');
        }
    }
};
