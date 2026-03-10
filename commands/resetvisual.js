const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildData, updateGuildData } = require('../userManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetconfig')
        .setDescription('🗑️ Borra la configuración visual del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('welcome')
                .setDescription('Borra la configuración de Bienvenidas (B1 y B2)'))
        .addSubcommand(sub =>
            sub.setName('goodbye')
                .setDescription('Borra la configuración de Despedidas')),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();
        let data = await getGuildData(guildId);

        if (!data.welcomeConfig) {
            return interaction.reply({ content: '❌ No hay ninguna configuración guardada para este servidor.', ephemeral: true });
        }

        if (sub === 'welcome') {
            // Borramos B1 y B2
            delete data.welcomeConfig.welcome_1;
            delete data.welcomeConfig.welcome_2;
            
            await updateGuildData(guildId, data);
            return interaction.reply({ content: '🗑️ Se han borrado las configuraciones de **Bienvenida (B1 y B2)**.', ephemeral: true });
        }

        if (sub === 'goodbye') {
            // Borramos Despedida
            delete data.welcomeConfig.despedida;
            
            await updateGuildData(guildId, data);
            return interaction.reply({ content: '🗑️ Se ha borrado la configuración de **Despedida**.', ephemeral: true });
        }
    }
};