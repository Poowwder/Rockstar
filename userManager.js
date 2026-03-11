const mongoose = require('mongoose');

// --- 👤 ESQUEMA DE USUARIO ---
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    health: { type: Number, default: 3 }, 
    deadCount: { type: Number, default: 0 }, 
    rep: { type: Number, default: 0 },
    premiumType: { type: String, default: 'none' }, 
    premiumUntil: { type: Date, default: null },
    activeBoosts: { type: Array, default: [] }, 
    job: { type: String, default: null },
    jobExperience: { type: Number, default: 0 },
    lastWork: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 }, // Añade esta línea a tu UserSchema
    workWarnings: { type: Number, default: 0 },
    inventory: { type: Object, default: {} }, 
    durabilidades: { type: Object, default: {} },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
});

// --- 🛒 ESQUEMA DE LA TIENDA ---
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

async function updateUserData(userId, data) {
    try {
        let user = await User.findOne({ userId });
        if (!user) user = await User.create({ userId });

        // Lógica de renacimiento (corazones enteros)
        if (data.health !== undefined && data.health <= 0) {
            user.deadCount += 1;
            user.health = 3; 
            delete data.health;
        }

        Object.assign(user, data);
        user.markModified('inventory');
        user.markModified('activeBoosts');
        await user.save();
        return true;
    } catch (err) { return false; }
}

async function addXP(userId, amount) {
    let user = await getUserData(userId);
    user.xp += amount;
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

// --- 🛒 FUNCIONES DE TIENDA (Las que faltaban exportar) ---
async function getShopItemsDB() { 
    try { return await ShopItem.find({}); } catch (e) { return []; } 
}

async function updateShopItemDB(id, itemData) { 
    try { 
        await ShopItem.findOneAndUpdate({ id }, { $set: itemData }, { upsert: true }); 
        return true; 
    } catch (err) { return false; } 
}

async function deleteShopItemDB(id) { 
    try { await ShopItem.findOneAndDelete({ id }); return true; } catch (err) { return false; } 
}

// 🔥 EXPORTACIÓN COMPLETA
module.exports = { 
    User, ShopItem, getUserData, updateUserData, addXP, 
    getShopItemsDB, updateShopItemDB, deleteShopItemDB 
};
