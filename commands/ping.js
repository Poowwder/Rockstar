const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping', // Nombre para prefijo
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('ping') // Nombre para Slash (OBLIGATORIO)
        .setDescription('Mira la latencia del bot y la API'),

    async execute(input) {
        // Detectar si es Interaction o Message
        const isSlash = !!input.user;
        const apiLatency = input.client.ws.ping;
        
        const embed = new EmbedBuilder()
            .setTitle('📡 Estado de Conexión')
            .setColor('#FFB6C1')
            .addFields(
                { name: '🌐 API Latency', value: `\`${apiLatency}ms\``, inline: true }
            )
            .setFooter({ text: 'Rockstar Bot Performance' });

        if (isSlash) {
            await input.reply({ embeds: [embed] });
        } else {
            await input.reply({ embeds: [embed] });
        }
    }
};