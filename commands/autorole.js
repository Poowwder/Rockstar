const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); // Conexión a tu central de datos

module.exports = {
    name: 'autorole',
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('🎭 Configura los roles automáticos al entrar al servidor')
        .addRoleOption(opt => 
            opt.setName('usuario')
                .setDescription('Rol para los nuevos miembros (humanos)')
                .setRequired(false))
        .addRoleOption(opt => 
            opt.setName('bot')
                .setDescription('Rol para los nuevos bots que se unan')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userRole = interaction.options.getRole('usuario');
        const botRole = interaction.options.getRole('bot');

        // Si no selecciona nada, avisamos
        if (!userRole && !botRole) {
            return interaction.reply({ 
                content: '❌ Debes seleccionar al menos un rol para configurar.', 
                ephemeral: true 
            });
        }

        // Preparamos los datos para MongoDB
        const updateData = {};
        if (userRole) updateData.userRoleId = userRole.id;
        if (botRole) updateData.botRoleId = botRole.id;

        try {
            // Guardamos o actualizamos en la DB centralizada
            await GuildConfig.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { $set: updateData },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setTitle('🎭 Auto-Role Configurado')
                .setColor('#FFB6C1')
                .setDescription('Rockstar asignará estos roles automáticamente a quienes se unan.')
                .addFields(
                    { name: '👤 Rol para Usuarios', value: userRole ? `${userRole}` : 'Sin cambios', inline: true },
                    { name: '🤖 Rol para Bots', value: botRole ? `${botRole}` : 'Sin cambios', inline: true }
                )
                .setFooter({ text: 'Recuerda que mi rol debe estar por encima de estos en los ajustes del servidor.' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Error en AutoRole:", error);
            return interaction.reply({ 
                content: '❌ Hubo un error al guardar la configuración en la base de datos.', 
                ephemeral: true 
            });
        }
    }
};