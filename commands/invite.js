const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Genera un enlace para invitar al bot a tu servidor.',
    aliases: ['invitar', 'add'], // Permite usar !!invitar o !!add también
    async execute(message, args) {
        
        // --- 🔗 GENERACIÓN DEL LINK ---
        // Usamos el ID del bot dinámicamente y el permiso de Administrador (8)
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot%20applications.commands`;

        // --- 🖼️ EMBED DE INVITACIÓN ---
        const embed = new EmbedBuilder()
            .setTitle('🌸 ¡Invita a Rockstar a tu servidor!')
            .setDescription(
                '¡Hola! Me hace mucha ilusión unirme a nuevas comunidades.\n\n' +
                'Haz clic en el botón de abajo para añadirme. Recuerda que necesito permisos de **Administrador** para funcionar correctamente con todos mis módulos (Economía, Niveles y Diversión).'
            )
            .setColor('#ffb7c5')
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: '¡Gracias por tu apoyo! ✨' });

        // --- 🔘 BOTÓN DE ENLACE ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invitar Bot')
                .setURL(inviteUrl) // Aquí va el link generado
                .setStyle(ButtonStyle.Link) // El estilo Link es obligatorio para URLs
                .setEmoji('🎀')
        );

        // --- 🚀 ENVÍO ---
        await message.reply({ embeds: [embed], components: [row] });
    },
};