const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js'); // Necesario para el DM

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    health: { type: Number, default: 3 }, 
    deadCount: { type: Number, default: 0 }, 
    premiumType: { type: String, default: 'none' }, 
    premiumUntil: { type: Date, default: null },
    lastMine: { type: Date, default: null },
    lastFish: { type: Date, default: null },
    lastCrime: { type: Date, default: null },
    lastRob: { type: Date, default: null },
    harem: { type: Array, default: [] },
    inventory: { type: Array, default: [] },
    
    // --- 🐾 NUEVA SECCIÓN DE NEKOS Y ESTADÍSTICAS ---
    interactionsCount: { type: Number, default: 0 }, // Para Solas (100)
    messageCount: { type: Number, default: 0 },      // Para Mizuki (5000)
    nekos: {
        solas: { type: Boolean, default: false },
        nyx: { type: Boolean, default: false },
        mizuki: { type: Boolean, default: false },
        astra: { type: Boolean, default: false },
        koko: { type: Boolean, default: false }
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- 🎀 FUNCIÓN PARA DAR NEKOS CON DM ---
async function grantNeko(userId, nekoId, client) {
    const user = await User.findOne({ userId });
    if (!user || user.nekos[nekoId]) return; // Si no existe o ya lo tiene, ignorar

    // Marcar como obtenido
    user.nekos[nekoId] = true;
    await user.save();

    // Enviar DM Aesthetic
    try {
        const discordUser = await client.users.fetch(userId);
        const names = { solas: 'Solas ☁️', nyx: 'Nyx 🌑', mizuki: 'Mizuki 🌸', astra: 'Astra 👑', koko: 'Koko 🍓' };
        const desc = {
            solas: 'tu carisma social (100 interacciones)',
            nyx: 'tu gran dedicación (Nivel 10)',
            mizuki: 'tu increíble actividad (+5,000 mensajes)',
            astra: 'tu estatus de élite (Premium)',
            koko: 'tu buen gusto en la Boutique'
        };

        const embed = new EmbedBuilder()
            .setTitle('✨ ¡𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖊𝖐𝖔 𝕬𝖑𝖊𝖗𝖙! ✨')
            .setColor('#E6E6FA')
            .setThumbnail(discordUser.displayAvatarURL())
            .setDescription(
                `*“Un destello de luz ha aparecido en tu perfil...”*\n\n` +
                `Has desbloqueado a **${names[nekoId]}**.\n` +
                `Se ha unido a ti por **${desc[nekoId]}**.\n\n` +
                `🐾 *Ya puedes presumirlo en tu \`/profile\`*`
            );

        await discordUser.send({ embeds: [embed] });
    } catch (e) { console.log(`DM bloqueado para ${userId}`); }
}

async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    
    if (user.premiumType !== 'none' && user.premiumUntil && new Date() > user.premiumUntil) {
        user.premiumType = 'none';
        user.premiumUntil = null;
        await user.save();
    }
    return user;
}

async function updateUserData(userId, data) {
    try {
        if (data.health <= 0) {
            data.deadCount = (data.deadCount || 0) + 1;
            data.health = 3; // Te lo reseteo a 3 para que no buclee en muerte
            data.wallet = 0; 
        }
        await User.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
        return true;
    } catch (err) { return false; }
}

module.exports = { User, getUserData, updateUserData, grantNeko };