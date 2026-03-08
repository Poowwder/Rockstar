const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['ayuda', 'h'],
    async execute(message, args) {
        const { commands } = message.client;

        const embed = new EmbedBuilder()
            .setTitle('🎀 Rockstar Bot Help')
            .setDescription('¡Hola! Soy tu asistente personal. Aquí tienes mi lista de comandos disponibles:')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/47/34/00/47340078869c9780074215f769493f0b.gif') // GIF de My Melody/Cute
            .addFields(
                { 
                    name: '🌸 Economía & Juego', 
                    value: '`bal`, `work`, `mine`, `fish`, `shop`, `buy`, `inv`', 
                    inline: false 
                },
                { 
                    name: '✨ Perfil & Logros', 
                    value: '`profile`, `rank`', 
                    inline: false 
                },
                { 
                    name: '🛠️ Utilidad', 
                    value: '`help`, `ping`', 
                    inline: false 
                }
            )
            .setFooter({ text: 'El prefijo es !! | ¡Diviértete! ✨' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};