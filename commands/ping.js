const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra la latencia del bot.'),
    category: 'info',
    description: 'Muestra la latencia del bot.',
    usage: '!!ping',
    async execute(message, args) {
        const sent = await message.reply({ content: 'Calculando...' });
        const roundtripLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Latencia (Ida y vuelta)', value: `\`${roundtripLatency}ms\``, inline: true },
                { name: 'Latencia de la API', value: `\`${apiLatency}ms\``, inline: true }
            )
            .setTimestamp();

        await sent.edit({ content: '', embeds: [embed] });
    },
    async executeSlash(interaction) {
        const sent = await interaction.reply({ content: 'Calculando...', fetchReply: true });
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Latencia (Ida y vuelta)', value: `\`${roundtripLatency}ms\``, inline: true },
                { name: 'Latencia de la API', value: `\`${apiLatency}ms\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    }
};