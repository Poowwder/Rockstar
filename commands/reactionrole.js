const { 
    SlashCommandBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    PermissionFlagsBits,
    ComponentType
} = require('discord.js');

module.exports = {
    name: 'reactionrole',
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('🔘 Añade un botón de rol a un mensaje existente')
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('ID del mensaje al que añadir el botón')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('El rol que el botón entregará')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji')
                .setDescription('Emoji para el botón (Nombre, ID o emoji estándar)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const role = interaction.options.getRole('rol');
        const emojiInput = interaction.options.getString('emoji');
        const channel = interaction.channel;

        // Validar jerarquía de roles (El bot no puede dar roles superiores al suyo)
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                content: '❌ No puedo asignar este rol porque está por encima de mi posición jerárquica.', 
                ephemeral: true 
            });
        }

        try {
            // Buscamos el mensaje en el canal actual
            const targetMessage = await channel.messages.fetch(messageId);
            if (!targetMessage.editable) {
                return interaction.reply({ content: '❌ No tengo permisos para editar ese mensaje.', ephemeral: true });
            }
            
            // Lógica de búsqueda de emoji
            let emoji = interaction.guild.emojis.cache.find(e => e.name === emojiInput || e.id === emojiInput) || emojiInput;

            const button = new ButtonBuilder()
                .setCustomId(`rr_${role.id}`)
                .setLabel(role.name)
                .setEmoji(emoji)
                .setStyle(ButtonStyle.Secondary); // Gris estético

            // Manejo de filas existentes
            let rows = targetMessage.components.map(row => ActionRowBuilder.from(row));
            
            // Si no hay filas, creamos la primera
            if (rows.length === 0) {
                rows.push(new ActionRowBuilder().addComponents(button));
            } else {
                // Buscamos la última fila que tenga espacio (< 5 botones)
                const lastRow = rows[rows.length - 1];
                if (lastRow.components.length < 5) {
                    lastRow.addComponents(button);
                } else if (rows.length < 5) {
                    // Si la última está llena pero hay menos de 5 filas, creamos una nueva
                    rows.push(new ActionRowBuilder().addComponents(button));
                } else {
                    return interaction.reply({ content: '❌ Este mensaje ha alcanzado el límite máximo de botones (25).', ephemeral: true });
                }
            }

            await targetMessage.edit({ components: rows });
            
            await interaction.reply({ 
                content: `✅ Botón para el rol **${role.name}** añadido al mensaje [${messageId}].`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Error en ReactionRole:", error);
            await interaction.reply({ 
                content: '❌ Error: Asegúrate de que el ID del mensaje sea correcto y esté en este canal.', 
                ephemeral: true 
            });
        }
    }
};