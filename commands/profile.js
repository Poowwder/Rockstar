const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    name: 'profile',
    aliases: ['perfil', 'p'],
    async execute(message, args) {
        // 1. Determinar de quién es el perfil (mención o el autor)
        const target = message.mentions.users.first() || message.author;
        
        // 2. Obtener los datos de MongoDB
        const data = await getUserData(target.id);

        if (!data) {
            return message.reply("❌ No se pudieron cargar los datos del perfil.");
        }

        // --- LÓGICA DE VISUALIZACIÓN DE MASCOTAS ---
        let pets = [];

        // Mascota 1: Mapache (100 Reacciones)
        if (data.inventory && data.inventory.has("Mapache Curioso 🦝")) {
            pets.push("🦝");
        } else {
            pets.push("🔒"); // Candado si no la tiene
        }

        // Mascota 2: Zorro (Nivel 10)
        if (data.inventory && data.inventory.has("Zorro Maestro 🦊")) {
            pets.push("🦊");
        } else {
            pets.push("🔒");
        }

        // Mascota 3: Búho (5,000 Mensajes)
        if (data.inventory && data.inventory.has("Búho Erudito 🦉")) {
            pets.push("🦉");
        } else {
            pets.push("🔒");
        }

        // Mascota 4: Hada/Unicornio (Premium Mensual o Bimestral)
        if (data.premiumType === 'mensual' || data.premiumType === 'bimestral') {
            pets.push("🦄");
        } else {
            pets.push("❌"); // Indica que requiere suscripción
        }

        // Mascota 5: Dragón (Solo Premium Bimestral)
        if (data.premiumType === 'bimestral') {
            pets.push("🐲");
        } else {
            pets.push("❌");
        }

        const petDisplay = pets.join("  ");

        // --- CREACIÓN DEL EMBED ---
        const embed = new EmbedBuilder()
            .setTitle(`✨ Rockstar Profile: ${target.username}`)
            .setColor('#FFB6C1') 
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { 
                    name: '⭐ Progreso de Nivel', 
                    value: `📈 **Nivel:** \`${data.level}\` \n✨ **XP:** \`${data.xp.toLocaleString()}\``, 
                    inline: true 
                },
                { 
                    name: '📊 Actividad Global', 
                    value: `💬 **Mensajes:** \`${data.messageCount.toLocaleString()}\` \n🎭 **Reacciones:** \`${data.reactionCount.toLocaleString()}\``, 
                    inline: true 
                },
                { 
                    name: '🐾 Colección de Mascotas (Logros)', 
                    value: `> ${petDisplay}`, 
                    inline: false 
                }
            )
            .setFooter({ 
                text: `Estatus: ${data.premiumType === 'none' ? 'Usuario Estándar' : data.premiumType.toUpperCase()}`
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};