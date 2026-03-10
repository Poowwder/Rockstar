const { UserProfile } = require('../data/mongodb.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// --- 🌸 CONFIGURACIÓN DE NEKOS ROCKSTAR (Imágenes Aesthetic Seleccionadas) ---
const NEKO_DATA = {
    ACCIONES: { 
        id: 1, 
        name: 'Solas',  
        emoji: '☀️', 
        img: 'https://i.pinimg.com/564x/0a/73/45/0a734567280f585d688849b38030230f.jpg' // Estilo cálido y social
    },
    NIVEL: { 
        id: 2, 
        name: 'Nyx',    
        emoji: '🌙', 
        img: 'https://i.pinimg.com/564x/72/06/61/720661168532470776b978a3f858564b.jpg' // Estilo nocturno y elegante
    },
    ACTIVO: { 
        id: 3, 
        name: 'Mizuki', 
        emoji: '🌊', 
        img: 'https://i.pinimg.com/564x/7a/7d/91/7a7d91970b8f1068222b516886e06180.jpg' // Estilo sereno y azulado
    },
    TIENDA: { 
        id: 4, 
        name: 'Astra',  
        emoji: '✨', 
        img: 'https://i.pinimg.com/564x/8a/80/7e/8a807e3241063468593a890a88062829.jpg' // Estilo brillante y sofisticado
    },
    PREMIUM: { 
        id: 5, 
        name: 'Koko',   
        emoji: '🎀', 
        img: 'https://i.pinimg.com/564x/de/6d/46/de6d4605175971488849b38030230f2f.jpg' // Estilo premium y rosado
    }
};

async function checkNekos(interaction, type) {
    const user = interaction.user || interaction.author;
    const guild = interaction.guild;

    if (!guild) return;

    let profile = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
    if (!profile) profile = new UserProfile({ UserID: user.id, GuildID: guild.id });

    let unlocked = null;

    if (type === 'action') {
        profile.ActionCount += 1;
        if (profile.ActionCount === 100) unlocked = NEKO_DATA.ACCIONES;
    } 
    else if (type === 'message') {
        profile.MessageCount += 1;
        if (profile.MessageCount === 5000) unlocked = NEKO_DATA.ACTIVO;
    } 
    else if (type === 'levelUp') {
        if (profile.Level >= 10 && !profile.Nekos.includes(NEKO_DATA.NIVEL.img)) {
            unlocked = NEKO_DATA.NIVEL;
        }
    }
    else if (type === 'tienda_manual') {
        const lastNekoImg = profile.Nekos[profile.Nekos.length - 1];
        unlocked = Object.values(NEKO_DATA).find(n => n.img === lastNekoImg);
    }

    if (unlocked && (!profile.Nekos.includes(unlocked.img) || type === 'tienda_manual')) {
        
        if (type !== 'tienda_manual') {
            profile.Nekos.push(unlocked.img);
        }
        await profile.save();

        const botEmojis = guild.emojis.cache.filter(e => e.available);
        const rndEmoji = botEmojis.size > 0 ? botEmojis.random().toString() : '✨';

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `Insignia Desbloqueada: ${unlocked.name}`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`Se ha integrado un nuevo logro a la colección. ${rndEmoji}\n\n*Este reconocimiento ya está disponible en el perfil.*`)
            .setImage(unlocked.img)
            .setColor('#FFB6C1') 
            .setFooter({ text: `Rockstar • Coleccionables de ${guild.name} 🐾` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ver_perfil_nekos')
                .setLabel('Ver mi colección')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📂')
        );

        try {
            await user.send({
                content: `✨ **¡Hola!**, hay una nueva actualización en los logros registrados en **${guild.name}**. ${rndEmoji}`,
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            if (interaction.channel) {
                await interaction.channel.send({
                    content: `✨ **${user.username}**, se ha desbloqueado un nuevo hito. ${rndEmoji}\n*(No fue posible enviar el detalle al privado)*`,
                    embeds: [embed],
                    components: [row]
                });
            }
        }
    } else {
        await profile.save();
    }
}

module.exports = { checkNekos, NEKO_DATA };