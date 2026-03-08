const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'reset',
    description: 'Reinicia la economía de un usuario (Admin)',
    async execute(message, args) {
        // 1. Verificar si el usuario tiene permisos de Administrador
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("🌸 Lo siento, linda, pero necesitas permisos de administrador para usar esto.");
        }

        // 2. Obtener al usuario mencionado
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply("✨ Menciona a alguien para reiniciar su perfil. Ejemplo: `!!reset @usuario`.");
        }

        // 3. Obtener los datos actuales
        let data = await getUserData(target.id);
        if (!data) return message.reply("❌ No encontré datos para ese usuario.");

        // 4. REINICIAR VALORES
        data.wallet = 0;
        data.bank = 0;
        data.xp = 0;
        data.level = 1;
        data.inventory = new Map(); // Limpia el inventario

        // 5. Guardar en MongoDB
        await updateUserData(target.id, data);

        // 6. Confirmación Aesthetic
        const embed = new EmbedBuilder()
            .setTitle('♻️ Perfil Reiniciado')
            .setDescription(`Se ha reseteado toda la economía y progreso de **${target.username}**.`)
            .setColor('#FF0000') // Rojo para indicar acción importante
            .setThumbnail('https://i.pinimg.com/originals/82/01/9a/82019adb656911f93e9a18017e810a9c.gif')
            .setFooter({ text: 'Acción realizada por un administrador ✨' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};