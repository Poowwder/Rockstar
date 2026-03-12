const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a tu base de datos para los logs

module.exports = {
    name: 'nuke',
    async execute(message) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ManageChannels')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para erradicar este dominio.');
        }
        
        // --- ☢️ LÓGICA DE PURGA (NUKE) ---
        const pos = message.channel.position;
        const newChan = await message.channel.clone();
        
        await message.channel.delete();
        await newChan.setPosition(pos);
        
        // Mensaje en el nuevo canal reconstruido
        const nukeEmbed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: '⊹ Dominio Purgado ⊹' })
            .setDescription(`╰┈➤ 🌑 Este canal ha sido erradicado y ha renacido de las sombras.\n> *Iniciado por: ${message.author.tag}*`)
            .setImage('https://i.pinimg.com/originals/a0/78/fb/a078fb2fc89d48b1aa61fae0a24b17b6.gif'); // GIF estético oscuro (puedes cambiarlo)

        await newChan.send({ embeds: [nukeEmbed] });

        // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
        try {
            const config = await GuildConfig.findOne({ GuildID: message.guild.id });
            
            if (config && config.LogChannelID) {
                const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setAuthor({ name: '⊹ Protocolo de Erradicación (Nuke) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(
                            `**Canal Purgado:** <#${newChan.id}> (\`${newChan.name}\`)\n` +
                            `**Ejecutor:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                            `> *Un dominio entero ha sido consumido por el vacío y clonado exitosamente.*`
                        )
                        .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error enviando log de nuke:", error);
        }
    }
};
