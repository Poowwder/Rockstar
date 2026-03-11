const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, 
    TextInputStyle, ActionRowBuilder, EmbedBuilder 
} = require('discord.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getE = (guild) => {
    const emojis = guild?.emojis.cache.filter(e => e.available);
    return (emojis && emojis.size > 0) ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'embed',
    description: '🖼️ Crea un mensaje estético personalizado.',
    category: 'utilidad',
    // Quitamos .setDefaultMemberPermissions para que sea para TODOS
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('🖼️ Diseña tu propio mensaje con un formulario'),

    async executeSlash(interaction) {
        // El Modal es la mejor forma de que el usuario escriba mucho texto cómodamente
        const modal = new ModalBuilder()
            .setCustomId('embed_modal_user')
            .setTitle('DISEÑADOR DE MENSAJES');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("¿Qué título le pondrás?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Mi Diario / Nota para el grupo')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Escribe tu mensaje")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Puedes usar negritas, cursivas, etc...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel("Color Hex (Ej: #ff0000)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#1a1a1a')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);

        // --- 🚀 MANEJO DE LA RESPUESTA ---
        const filter = (i) => i.customId === 'embed_modal_user' && i.user.id === interaction.user.id;
        
        interaction.awaitModalSubmit({ filter, time: 300000 })
            .then(async (submitted) => {
                const title = submitted.fields.getTextInputValue('title');
                const description = submitted.fields.getTextInputValue('description');
                const color = submitted.fields.getTextInputValue('color') || '#1a1a1a';
                const e = getE(interaction.guild);

                const userEmbed = new EmbedBuilder()
                    .setTitle(`${e} ${title} ${e}`)
                    .setDescription(description)
                    .setColor(color.startsWith('#') ? color : '#1a1a1a')
                    .setFooter({ text: `Nota de: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                // Respondemos al modal para que no de error de interacción
                await submitted.reply({ content: `✨ Tu mensaje ha sido enviado.`, ephemeral: true });
                // Enviamos el embed al canal
                await interaction.channel.send({ embeds: [userEmbed] });
            })
            .catch(() => null);
    }
};
