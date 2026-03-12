const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Importamos tu base de datos

module.exports = {
    name: 'mute',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para silenciar en las sombras.');
        }
        
        const user = message.mentions.members.first();
        if (!user) {
            return message.reply('╰┈➤ ⚠️ Menciona a la persona que deseas silenciar.');
        }
        
        // --- 🔇 LÓGICA DEL ROL MUTED ---
        let muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) {
            muteRole = await message.guild.roles.create({ name: 'Muted', color: '#000000' });
            message.guild.channels.cache.forEach(ch => ch.permissionOverwrites.create(muteRole, { SendMessages: false }).catch(() => {}));
        }

        await user.roles.add(muteRole);
        message.reply(`╰┈➤ 🌑 **${user.user.tag}** ha sido silenciado. Sus palabras ya no existen aquí.`);

        // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
        try {
            // Buscamos el canal que guardaste con !!setlogs
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Protocolo de Silencio ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Usuario Silenciado:** ${user.user.tag} (\`${user.id}\`)\n` +
                            `**Moderador:** ${message.author.tag}\n` +
                            `> *Las sombras le han arrebatado la voz.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error enviando log de mute:", error);
        }
    }
};
