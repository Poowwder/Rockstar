const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    health: { type: Number, default: 3 }, 
    deadCount: { type: Number, default: 0 }, 
    rep: { type: Number, default: 0 },
    premiumType: { type: String, default: 'none' }, 
    premiumUntil: { type: Date, default: null },
    lastCrime: { type: Date, default: null },
    inventory: { type: Object, default: {} }, // Guardado como objeto para cantidades
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    nekos: {
        solas: { type: Boolean, default: false },
        nyx: { type: Boolean, default: false },
        mizuki: { type: Boolean, default: false },
        astra: { type: Boolean, default: false },
        koko: { type: Boolean, default: false }
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- 📈 FUNCIÓN DE EXPERIENCIA CON MULTIPLICADORES ---
async function addXP(userId, amount, client) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    let multiplicador = 1; 
    const rango = (user.premiumType || 'none').toLowerCase();

    // Lógica de rangos: Ultra (2x), Pro (1.5x)
    if (rango === 'ultra' || rango === 'bimestral') multiplicador = 2.0;
    else if (rango === 'pro' || rango === 'mensual') multiplicador = 1.5;

    const xpFinal = Math.floor(amount * multiplicador);
    user.xp += xpFinal;

    const nextLevelXP = user.level * 500;

    if (user.xp >= nextLevelXP) {
        user.level += 1;
        user.xp -= nextLevelXP; // Mantiene el sobrante para el siguiente nivel
        
        if (user.level === 10 && !user.nekos.nyx) {
            await grantNeko(userId, 'nyx', client);
        }
        await user.save();
        return { leveledUp: true, level: user.level };
    }
    
    await user.save();
    return { leveledUp: false };
}

async function grantNeko(userId, nekoId, client) {
    const user = await User.findOne({ userId });
    if (!user || user.nekos[nekoId]) return;
    user.nekos[nekoId] = true;
    await user.save();
    // (Aquí iría el código de envío de DM que ya tienes...)
}

async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    return user;
}

async function updateUserData(userId, data) {
    try {
        await User.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
        return true;
    } catch (err) { return false; }
}

async function getShopItemsDB() { return []; }

// 🚀 EXPORTACIONES COMPLETAS
module.exports = { 
    User, 
    getUserData, 
    updateUserData, 
    addXP, // <-- Ahora el index.js sí podrá ver esta función
    getShopItemsDB 
};
