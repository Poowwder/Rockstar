const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a la base de datos para los logs

module.exports = {
    name: 'unban',
    description: 'Desbanea a un usuario mediante su ID.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para perdonar a los exiliados.');
        }
        
        const userId = args[0];
        if (!userId) {
            return message.reply('╰┈➤ ⚠️ Debes proveer el ID del alma que deseas retornar de las sombras.');
        }

        try {
            // --- 🔓 LÓGICA DE UNBAN ---
            await message.guild.members.unban(userId);
            message.reply(`╰┈➤ 🌑 El usuario con ID \`${userId}\` ha sido perdonado. Las puertas se abren de nuevo.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Exilio Revocado (Unban) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Usuario Perdonado (ID):** \`${userId}\`\n` +
                            `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `> *Un alma ha sido liberada del abismo y puede volver a caminar entre nosotros.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            message.reply('╰┈➤ ❌ Las sombras no retienen a ninguna entidad con ese ID o hubo un error en la revocación.');
        }
    }
};
