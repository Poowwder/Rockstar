const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js'); 

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

        if (!userRole && !botRole) {
            return interaction.reply({ 
                content: '╰┈➤ ❌ Debes seleccionar al menos un rol para configurar.', 
                ephemeral: true 
            });
        }

        // Validación de jerarquía: ¿El bot puede gestionar estos roles?
        const botMember = interaction.guild.members.me;
        if ((userRole && userRole.position >= botMember.roles.highest.position) || 
            (botRole && botRole.position >= botMember.roles.highest.position)) {
            return interaction.reply({
                content: '╰┈➤ ⚠️ **Error de Jerarquía:** No puedo asignar roles que están por encima de mi propio rol. Sube mi rol en los ajustes del servidor.',
                ephemeral: true
            });
        }

        const updateData = {};
        if (userRole) updateData.userRoleId = userRole.id;
        if (botRole) updateData.botRoleId = botRole.id;

        try {
            await GuildConfig.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { $set: updateData },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setTitle('🎭 PROTOCOLO DE IDENTIDAD: ACTIVADO')
                .setColor('#1a1a1a') // Estética Dark Rockstar
                .setThumbnail('https://i.pinimg.com/originals/a9/1a/1a/a91a1a5118c64227f7178a994784157d.gif')
                .setDescription(
                    `> *“En Rockstar Nightfall, todos tienen un lugar asignado desde el inicio.”*\n\n` +
                    `Rockstar gestionará los siguientes roles automáticamente:`
                )
                .addFields(
                    { name: '👤 Miembros', value: userRole ? `${userRole}` : '保持 (Sin cambios)', inline: true },
                    { name: '🤖 Automatas', value: botRole ? `${botRole}` : '保持 (Sin cambios)', inline: true }
                )
                .setFooter({ text: 'Asegúrate de que mis permisos sean superiores a los roles configurados.' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Error en AutoRole:", error);
            return interaction.reply({ 
                content: '❌ Hubo un error al sincronizar con la central de datos MongoDB.', 
                ephemeral: true 
            });
        }
    }
};
