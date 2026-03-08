const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🎀 Revisa mi latencia de una forma cute'),

    async execute(input) {
        // Obtenemos el miembro para sacar el apodo (displayName)
        const member = input.member;
        const apiPing = input.client.ws.ping;
        
        // Creamos el Embed Aesthetic
        const pingEmbed = new EmbedBuilder()
            .setTitle('🌸 ¡Holi! Mi señal está así:')
            .setColor('#FFB6C1') // Rosa pastel
            .setThumbnail('https://i.pinimg.com/originals/8a/6c/4a/8a6c4a93883a908a8e32918f0f09a18d.gif')
            .setDescription(
                `╰┈➤ **Latencia API:** \`${apiPing}ms\`\n` +
                `╰┈➤ **Estado:** \`Estable y lista para ti\` ✨`
            )
            .addFields(
                { name: '☁️ Servidor', value: '`Conectado vía Render`', inline: true },
                { name: '✨ Energía', value: '`100% Rockstar`', inline: true }
            )
            .setTimestamp() // Timestamp solicitado
            .setFooter({ 
                text: `Solicitado por: ${member.displayName}`, // Aquí usamos el apodo del servidor
                iconURL: (input.user ? input.user.displayAvatarURL() : input.author.displayAvatarURL()) 
            });

        return input.reply({ embeds: [pingEmbed] });
    }
};