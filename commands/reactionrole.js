const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'reaction-role',
    data: new SlashCommandBuilder()
        .setName('reaction-role')
        .setDescription('🔘 Añade un botón de rol a un mensaje existente')
        .addStringOption(option => option.setName('message_id').setDescription('ID del mensaje al que añadir el botón').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('El rol que el botón entregará').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('Nombre o ID del emoji del servidor').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const role = interaction.options.getRole('rol');
        const emojiInput = interaction.options.getString('emoji');
        const channel = interaction.channel;

        try {
            // Buscamos el mensaje en el canal actual
            const targetMessage = await channel.messages.fetch(messageId);
            
            // Buscamos el emoji en el servidor por nombre o ID
            const emoji = interaction.guild.emojis.cache.find(e => e.name === emojiInput || e.id === emojiInput) || emojiInput;

            const button = new ButtonBuilder()
                .setCustomId(`rr_${role.id}`)
                .setLabel(role.name)
                .setEmoji(emoji)
                .setStyle(ButtonStyle.Secondary); // Color Gris Aesthetic

            // Comprobamos si el mensaje ya tiene botones (ActionRows)
            let rows = targetMessage.components.length > 0 
                ? ActionRowBuilder.from(targetMessage.components[0]) 
                : new ActionRowBuilder();

            // Si la primera fila está llena (5 botones máx), podrías necesitar una segunda, 
            // pero para simplificar, lo añadimos a la primera.
            if (rows.components.length >= 5) {
                return interaction.reply({ content: '❌ Este mensaje ya tiene el máximo de 5 botones en esta fila.', ephemeral: true });
            }

            rows.addComponents(button);

            await targetMessage.edit({ components: [rows] });
            
            await interaction.reply({ content: `✅ Botón para **${role.name}** añadido con éxito.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error: No encontré el mensaje o no tengo permisos para editarlo.', ephemeral: true });
        }
    }
};