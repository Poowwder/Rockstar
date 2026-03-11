const { 
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, 
    ActionRowBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'webhook',
    description: '👑 Crea un mensaje estético (Embed) mediante Webhooks.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('👑 Crea un Embed personalizado vía Webhook')
        .addChannelOption(option => 
            option.setName('canal')
                .setDescription('¿En qué canal quieres enviar el anuncio?')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');
        const modal = new ModalBuilder()
            .setCustomId(`webhook_modal_${canal.id}`)
            .setTitle('🎨 DISEÑADOR ROCKSTAR PRO');

        const titleInput = new TextInputBuilder()
            .setCustomId('w_title').setLabel('Título').setStyle(TextInputStyle.Short).setPlaceholder('Ej: ✨ NOTICIAS ✨').setRequired(false);
        const descInput = new TextInputBuilder()
            .setCustomId('w_desc').setLabel('Descripción').setStyle(TextInputStyle.Paragraph).setPlaceholder('Contenido del mensaje...').setRequired(true);
        const colorInput = new TextInputBuilder()
            .setCustomId('w_color').setLabel('Color Hex').setStyle(TextInputStyle.Short).setPlaceholder('#1a1a1a').setRequired(false);
        const imageInput = new TextInputBuilder()
            .setCustomId('w_image').setLabel('URL Imagen').setStyle(TextInputStyle.Short).setPlaceholder('https://...').setRequired(false);
        const footerInput = new TextInputBuilder()
            .setCustomId('w_footer').setLabel('Pie de página').setStyle(TextInputStyle.Short).setPlaceholder('Staff Rockstar').setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(footerInput)
        );

        await interaction.showModal(modal);

        // --- LÓGICA DE ENVÍO ---
        const filter = (i) => i.customId === `webhook_modal_${canal.id}`;
        interaction.awaitModalSubmit({ filter, time: 600000 })
            .then(async (submitted) => {
                const title = submitted.fields.getTextInputValue('w_title');
                const desc = submitted.fields.getTextInputValue('w_desc');
                const color = submitted.fields.getTextInputValue('w_color') || '#1a1a1a';
                const image = submitted.fields.getTextInputValue('w_image');
                const footer = submitted.fields.getTextInputValue('w_footer');

                const embed = new EmbedBuilder()
                    .setDescription(desc)
                    .setColor(color.startsWith('#') ? color : '#1a1a1a')
                    .setTimestamp();
                
                if (title) embed.setTitle(title);
                if (image && image.startsWith('http')) embed.setImage(image);
                if (footer) embed.setFooter({ text: footer });

                // Crear Webhook temporal
                const webhook = await canal.createWebhook({
                    name: 'Rockstar Announcements',
                    avatar: interaction.guild.iconURL(),
                });

                await webhook.send({ embeds: [embed] });
                await webhook.delete(); // Limpiamos para no saturar de webhooks

                await submitted.reply({ content: `✅ Anuncio enviado a ${canal}.`, ephemeral: true });
            }).catch(() => null);
    }
};
