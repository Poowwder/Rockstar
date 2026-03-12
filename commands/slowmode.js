const ms = require('ms');
const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conectamos los logs

module.exports = {
    name: 'slowmode',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ManageChannels')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar el flujo temporal.');
        }

        const time = args[0];
        if (!time) {
            return message.reply('╰┈➤ ⚠️ Indica el lapso de letargo (ej: 10s, 1m) o 0 para restaurar el flujo normal.');
        }
        
        // --- ⏳ LÓGICA DE SLOWMODE ---
        const seconds = time === '0' ? 0 : ms(time) / 1000;

        if (seconds === undefined || isNaN(seconds)) {
            return message.reply('╰┈➤ ❌ Formato de tiempo inválido. Usa segundos (s), minutos (m) u horas (h).');
        }

        try {
            await message.channel.setRateLimitPerUser(seconds);
            message.reply(`╰┈➤ 🌑 Flujo temporal modificado. Letargo: **${time === '0' ? 'Desactivado' : time}**.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Control Temporal (Slowmode) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Canal:** <#${message.channel.id}>\n` +
                            `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `**Nuevo lapso:** \`${time === '0' ? 'Desactivado' : time}\`\n` +
                            `> *El tiempo en las sombras ha sido alterado.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error en slowmode:", error);
            message.reply('╰┈➤ ❌ Las sombras rechazaron tu mandato. Revisa mis permisos en este canal.');
        }
    }
};
