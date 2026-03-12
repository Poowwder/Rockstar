const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a la base de datos para los logs

module.exports = {
    name: 'untimeout',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para revocar el aislamiento.');
        }
        
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Menciona al alma que deseas liberar del exilio temporal.');
        }

        try {
            // --- ⏳ LÓGICA DE UNTIMEOUT ---
            // En Discord, enviar 'null' elimina el timeout
            await member.timeout(null, `Aislamiento revocado por ${message.author.tag}`);
            message.reply(`╰┈➤ 🌑 El aislamiento de **${member.user.tag}** ha sido revocado. Es libre de vagar de nuevo.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Aislamiento Revocado (Untimeout) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Usuario Liberado:** ${member.user.tag} (\`${member.id}\`)\n` +
                            `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `> *El exilio temporal ha concluido.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error en untimeout:", error);
            message.reply('╰┈➤ ❌ Hubo un error al intentar revocar el aislamiento. Revisa mi jerarquía de roles.');
        }
    }
};
