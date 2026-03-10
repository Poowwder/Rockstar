const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { UserProfile } = require('../data/mongodb.js');

module.exports = {
    name: 'nekos',
    data: new SlashCommandBuilder()
        .setName('nekos')
        .setDescription('🐱 Mira tu colección de nekos desbloqueados'),

    async execute(interaction) {
        // Buscamos el perfil en la nueva DB
        let profile = await UserProfile.findOne({ 
            UserID: interaction.user.id, 
            GuildID: interaction.guild.id 
        });

        if (!profile || profile.Nekos.length === 0) {
            return interaction.reply({ 
                content: '🐾 No tienes nekos coleccionados aún. ¡Sigue participando en el servidor para ganar uno!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🐱 Inventario de ${interaction.user.username}`)
            .setDescription(`**Tus Nekos desbloqueados:**\n\n${profile.Nekos.join(' ')}`)
            .setColor('#FFB6C1')
            .setFooter({ text: `Total: ${profile.Nekos.length} coleccionables` })
            .setThumbnail(interaction.user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    }
};