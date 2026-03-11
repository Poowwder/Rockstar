const { 
    SlashCommandBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    PermissionFlagsBits 
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

        // --- 🛡️ VALIDACIÓN DE JERARQUÍA ---
        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ 
                content: '╰┈➤ ❌ **Error de Jerarquía:** No puedo asignar el rol `' + role.name + '` porque está por encima de mi posición.', 
                ephemeral: true 
            });
        }

        try {
            // Buscamos el mensaje en el canal actual
            const targetMessage = await channel.messages.fetch(messageId);
            
            if (!targetMessage.editable) {
                return interaction.reply({ 
                    content: '╰┈➤ ❌ No puedo editar ese mensaje. Asegúrate de que el mensaje fue enviado por mí (Rockstar Bot).', 
                    ephemeral: true 
                });
            }
            
            // --- 🎨 LÓGICA DE EMOJI ---
            let emoji = interaction.guild.emojis.cache.find(e => e.name === emojiInput || e.id === emojiInput) || emojiInput;

            const button = new ButtonBuilder()
                .setCustomId(`rr_${role.id}`)
                .setLabel(role.name)
                .setEmoji(emoji)
                .setStyle(ButtonStyle.Secondary); // Gris Rockstar

            // --- 🧩 MANEJO DE COMPONENTES ---
            let rows = targetMessage.components.map(row => ActionRowBuilder.from(row));
            
            if (rows.length === 0) {
                rows.push(new ActionRowBuilder().addComponents(button));
            } else {
                const lastRow = rows[rows.length - 1];
                if (lastRow.components.length < 5) {
                    lastRow.addComponents(button);
                } else if (rows.length < 5) {
                    rows.push(new ActionRowBuilder().addComponents(button));
                } else {
                    return interaction.reply({ 
                        content: '╰┈➤ ❌ Este mensaje ya alcanzó el límite máximo de botones permitido por Discord.', 
                        ephemeral: true 
                    });
                }
            }

            await targetMessage.edit({ components: rows });
            
            await interaction.reply({ 
                content: `╰┈➤ ✅ Sistema de rol **${role.name}** inyectado correctamente en el mensaje \`${messageId}\`.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Error en ReactionRole:", error);
            await interaction.reply({ 
                content: '╰┈➤ ❌ **Error:** No encontré el mensaje. Asegúrate de estar en el mismo canal donde está el mensaje.', 
                ephemeral: true 
            });
        }
    }
};
