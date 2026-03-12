const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conectamos los logs

module.exports = {
    name: 'purge',
    aliases: ['clear'],
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para manipular el vacío.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('╰┈➤ ⚠️ Indica una cantidad entre 1 y 100 mensajes para consumir.');
        }

        try {
            // Borramos el propio comando del usuario para no dejar rastro
            await message.delete().catch(() => {});

            // --- 🗑️ LÓGICA DE PURGA ---
            // 'true' ignora los mensajes de más de 14 días para que Discord no crashee
            const deleted = await message.channel.bulkDelete(amount, true);
            
            const replyMsg = await message.channel.send(`╰┈➤ 🌑 **${deleted.size}** mensajes han sido devorados por las sombras.`);
            
            // Borramos el mensaje de confirmación después de 3 segundos
            setTimeout(() => replyMsg.delete().catch(() => {}), 3000);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Limpieza de Sombras (Purge) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Canal:** <#${message.channel.id}>\n` +
                            `**Ejecutor:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `**Cantidad:** \`${deleted.size}\` mensajes erradicados\n` +
                            `> *El historial ha sido borrado de la existencia.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error en purge:", error);
            message.channel.send('╰┈➤ ❌ Las sombras se resistieron. Hubo un error al purgar.').then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }
    }
};
