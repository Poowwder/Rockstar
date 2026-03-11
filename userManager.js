const mongoose = require('mongoose');

// --- 👤 ESQUEMA DE USUARIO ROCKSTAR ---
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    health: { type: Number, default: 3 }, 
    deadCount: { type: Number, default: 0 }, 
    rep: { type: Number, default: 0 },
    premiumType: { type: String, default: 'none' }, 
    premiumUntil: { type: Date, default: null },
    harem: { type: Array, default: [] }, 
    activeBoosts: { type: Array, default: [] }, 
    job: { type: String, default: null },
    jobExperience: { type: Number, default: 0 }, // 📈 Contador de ascensos
    lastWork: { type: Number, default: 0 },
    workWarnings: { type: Number, default: 0 },
    inventory: { type: Object, default: {} }, 
    durabilidades: { type: Object, default: {} },
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

const ShopItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '📦' },
    price: { type: Number, required: true },
    tipo: { type: String, default: 'fijo' },
    categoria: { type: String, default: 'VARIOS' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const ShopItem = mongoose.models.ShopItem || mongoose.model('ShopItem', ShopItemSchema);

// --- 📉 FUNCIONES ---

async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    return user;
}

async function addXP(userId, amount, client) {
    let user = await getUserData(userId);
    let multiplicador = 1; 
    const rango = (user.premiumType || 'none').toLowerCase();
    if (rango === 'ultra' || rango === 'bimestral') multiplicador = 2.0;
    else if (rango === 'pro' || rango === 'mensual') multiplicador = 1.5;

    user.xp += Math.floor(amount * multiplicador);
    const nextLevel = user.level * 500;
    if (user.xp >= nextLevel) {
        user.level += 1;
        user.xp -= nextLevel;
        await user.save();
        return { leveledUp: true, level: user.level };
    }
    await user.save();
    return { leveledUp: false };
}

async function updateUserData(userId, data) {
    try {
        let user = await User.findOne({ userId });
        if (!user) user = await User.create({ userId });

        // 💀 RENACIMIENTO AUTOMÁTICO
        if (data.health !== undefined && data.health <= 0) {
            const rank = (user.premiumType || 'none').toLowerCase();
            const inv = user.inventory || {};
            const newInv = { ...inv };
            let loss = rank.includes('ultra') ? 0.05 : rank.includes('pro') ? 0.10 : 0.15;
            let vLoss = rank.includes('ultra') ? 2 : rank.includes('pro') ? 0.35 : 0.50;

            for (let id in newInv) {
                if (newInv[id] <= 0) continue;
                if (id === 'vida') {
                    if (rank.includes('ultra')) newInv[id] = Math.max(0, newInv[id] - vLoss);
                    else newInv[id] = Math.max(0, Math.floor(newInv[id] * (1 - vLoss)));
                } else {
                    newInv[id] = Math.max(0, Math.floor(newInv[id] * (1 - loss)));
                }
            }
            user.inventory = newInv;
            user.deadCount += 1;
            user.health = 3; 
            delete data.health;
            delete data.inventory;
        }

        Object.assign(user, data);
        user.markModified('inventory');
        user.markModified('durabilidades');
        user.markModified('harem');
        user.markModified('activeBoosts');

        await user.save();
        return true;
    } catch (err) { return false; }
}

module.exports = { User, ShopItem, getUserData, updateUserData, addXP };
