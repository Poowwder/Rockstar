const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conectamos los logs

module.exports = {
    name: 'unmute',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para restaurar voces en las sombras.');
        }
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply('╰┈➤ ⚠️ Menciona a la entidad a la que deseas devolverle la voz.');
        }

        const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return message.reply('╰┈➤ ❌ Este usuario no se encuentra silenciado por las sombras.');
        }

        try {
            // --- 🔊 LÓGICA DE UNMUTE ---
            await member.roles.remove(muteRole);
            message.reply(`╰┈➤ 🌑 **${member.user.tag}** ha recuperado su voz. El silencio se desvanece.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Restauración de Voz (Unmute) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Usuario Restaurado:** ${member.user.tag} (\`${member.id}\`)\n` +
                            `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `> *La mordaza ha sido retirada. Sus palabras vuelven a existir aquí.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error en unmute:", error);
            message.reply('╰┈➤ ❌ Hubo un error al intentar devolverle la voz. Revisa mi jerarquía de roles.');
        }
    }
};
