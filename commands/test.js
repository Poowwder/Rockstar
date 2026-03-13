const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'test',
    category: 'configuración', // 🛡️ Ponle 'oculto' si prefieres que no salga en !!help
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('🧪 Simula eventos de red para probar diseños.')
        .addStringOption(option => 
            option.setName('evento')
                .setDescription('Elige qué protocolo del sistema deseas simular')
                .setRequired(true)
                .addChoices(
                    { name: 'Bienvenida (B1)', value: 'join' },
                    { name: 'Despedida', value: 'leave' },
                    { name: 'Inyección de Poder (Boost)', value: 'boost' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const evento = interaction.options.getString('evento');
        const client = interaction.client;

        if (evento === 'join') {
            // Emitimos el evento de entrada
            client.emit('guildMemberAdd', interaction.member);
            await interaction.reply({ content: '╰┈➤ ✨ **Simulación de Bienvenida iniciada.** Revisa el canal asignado.', ephemeral: true });
            
        } else if (evento === 'leave') {
            // Emitimos el evento de salida
            client.emit('guildMemberRemove', interaction.member);
            await interaction.reply({ content: '╰┈➤ 🥀 **Simulación de Despedida iniciada.** Revisa el canal asignado.', ephemeral: true });
            
        } else if (evento === 'boost') {
            // 🎭 TRUCO DE SOMBRAS: Creamos dos versiones falsas de ti
            const oldMember = Object.create(interaction.member);
            Object.defineProperty(oldMember, 'premiumSince', { value: null }); // Sin Nitro

            const newMember = Object.create(interaction.member);
            Object.defineProperty(newMember, 'premiumSince', { value: new Date() }); // Con Nitro comprado ahora mismo

            // Engañamos a Rockstar emitiendo el evento con los clones
            client.emit('guildMemberUpdate', oldMember, newMember);
            await interaction.reply({ content: '╰┈➤ 💎 **Simulación de Mecenazgo (Boost) iniciada.** Revisa tu canal de anuncios.', ephemeral: true });
        }
    }
};
