const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a la base de datos para logs
const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
    name: 'unwarn',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('╰┈➤ ❌ Careces de autoridad para alterar los expedientes de las sombras.');
        }

        const user = message.mentions.users.first();
        const warnId = args[1]; // El segundo argumento debe ser el ID

        if (!user || !warnId) {
            return message.reply('╰┈➤ ⚠️ Uso correcto: `!!unwarn @usuario [ID_del_warn]`');
        }

        // --- 📂 LECTURA DEL ARCHIVO ---
        let warns = {};
        try {
            warns = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
        } catch (e) {
            warns = {};
        }

        if (warns[message.guild.id] && warns[message.guild.id][user.id]) {
            const initialLength = warns[message.guild.id][user.id].length;
            
            // Filtramos la advertencia que coincida con el ID
            warns[message.guild.id][user.id] = warns[message.guild.id][user.id].filter(w => w.id !== warnId);
            
            // Si la longitud es la misma, significa que no encontró ese ID
            if (warns[message.guild.id][user.id].length === initialLength) {
                return message.reply('╰┈➤ ❌ No se encontró ninguna advertencia con ese ID en su expediente.');
            }

            // Guardamos los cambios
            fs.writeFileSync(warningsPath, JSON.stringify(warns, null, 2));
            message.reply(`╰┈➤ 🌑 La advertencia \`${warnId}\` ha sido borrada del expediente de **${user.tag}**.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            try {
                const config = await GuildConfig.findOne({ GuildID: message.guild.id });
                
                if (config && config.LogChannelID) {
                    const logChannel = message.guild.channels.cache.get(config.LogChannelID);
                    
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor('#1a1a1a')
                            .setAuthor({ name: '⊹ Indulto de Expediente (Unwarn) ⊹', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setDescription(
                                `**Usuario Indultado:** ${user.tag} (\`${user.id}\`)\n` +
                                `**Moderador:** ${message.author.tag} (\`${message.author.id}\`)\n` +
                                `**Warn ID Removido:** \`${warnId}\`\n` +
                                `> *Una mancha en su historial ha sido borrada de la existencia.*`
                            )
                            .setFooter({ text: `Rockstar ⊹ Vigilancia` })
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            } catch (error) {
                console.error("Error enviando log de unwarn:", error);
            }
            
        } else {
            message.reply('╰┈➤ ❌ Este usuario no tiene antecedentes registrados en las sombras.');
        }
    }
};
