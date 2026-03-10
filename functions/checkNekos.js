const NekoSchema = require('../models/nekoSchema.js');
const { EmbedBuilder } = require('discord.js');

// --- 🐱 BASE DE DATOS DE NEKOS (Badges) ---
const NEKO_DATA = {
    TIENDA: { 
        id: 'astra', 
        name: 'Astra', 
        img: 'https://i.pinimg.com/564x/8a/1e/83/8a1e8369528e08d66099b2512f36f6d0.jpg', // Un gato cósmico/dark
        desc: 'La guardiana de las estrellas. Solo para la élite.' 
    },
    PREMIUM: { 
        id: 'koko', 
        name: 'Koko', 
        img: 'https://i.pinimg.com/564x/0a/7b/4c/0a7b4c82734105658e0a8163f5383561.jpg', // Un gato aesthetic/fresa
        desc: 'Una esencia dulce pero peligrosa. Un emblema de estatus.' 
    },
    MINERO: { 
        id: 'shadow', 
        name: 'Shadow', 
        img: 'https://i.pinimg.com/564x/33/21/55/332155f98e77a6411133333333333333.jpg', 
        desc: 'Encontrado en lo más profundo del Abismo Eterno.' 
    }
};

async function checkNekos(message, type, extraData = {}) {
    const user = message.author || message.user;
    const guildId = message.guild.id;

    try {
        let userNeko = await NekoSchema.findOneAndUpdate(
            { userId: user.id, guildId },
            { $setOnInsert: { userId: user.id, guildId } },
            { upsert: true, returnDocument: 'after' }
        );

        // 1. Lógica de Puntos Original
        if (type === 'message') userNeko.activityPoints += 1;
        if (type === 'action') userNeko.actionPoints += 1;

        // 2. Sistema de Niveles (Rockstar Style)
        const nextLevel = userNeko.level * 50;
        if (userNeko.activityPoints >= nextLevel) {
            userNeko.level += 1;
            // Opcional: Mandar mensaje de level up aesthetic aquí
        }

        // 3. 🎀 LÓGICA DE DESBLOQUEO VISUAL (Lo que lo hace "Mejor")
        // Si el tipo es 'tienda_manual' (desde buy.js) o 'logro'
        if (type === 'tienda_manual' || type === 'premio') {
            const nekoKey = extraData.nekoKey; // Ej: 'TIENDA' o 'PREMIUM'
            const info = NEKO_DATA[nekoKey];

            if (info && !userNeko.unlockedNekos.includes(info.img)) {
                userNeko.unlockedNekos.push(info.img);

                const embed = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle('⟢ ₊˚ Nuevo Neko Desbloqueado ˚₊ ⟣')
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
                    .setDescription(`> *“${info.desc}”*\n\n╰┈➤ Has vinculado tu alma con **${info.name}**. Ahora brilla en tu perfil.`)
                    .setImage(info.img)
                    .setFooter({ text: 'Exclusividad • Rockstar Bot' });

                await message.channel.send({ embeds: [embed] });
            }
        }

        await userNeko.save();
    } catch (error) {
        console.error('❌ Error en checkNekos:', error);
    }
}

module.exports = { checkNekos, NEKO_DATA };
