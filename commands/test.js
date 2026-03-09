const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'test-system',
    data: new SlashCommandBuilder()
        .setName('test-system')
        .setDescription('🧪 Simula un evento de entrada o salida para probar el diseño')
        .addStringOption(option => 
            option.setName('evento')
                .setDescription('¿Qué quieres probar?')
                .setRequired(true)
                .addChoices(
                    { name: 'Bienvenida (B1)', value: 'join' },
                    { name: 'Despedida', value: 'leave' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const evento = interaction.options.getString('evento');
        const client = interaction.client;

        if (evento === 'join') {
            // Emitimos el evento como si alguien acabara de entrar
            client.emit('guildMemberAdd', interaction.member);
            await interaction.reply({ content: '✨ Simulación de **Bienvenida** enviada.', ephemeral: true });
        } else {
            // Emitimos el evento como si alguien acabara de salir
            client.emit('guildMemberRemove', interaction.member);
            await interaction.reply({ content: '👋 Simulación de **Despedida** enviada.', ephemeral: true });
        }
    }
};