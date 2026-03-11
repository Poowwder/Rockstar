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
    
    // 💍 Vínculos (Agregado para que tus matrimonios funcionen)
    harem: { type: Array, default: [] }, 
    
    // Trabajo y Cooldowns
    job: { type: String, default: null },
    lastWork: { type: Number, default: 0 },
    workWarnings: { type: Number, default: 0 },
    lastCrime: { type: Date, default: null },
    
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

// --- 🛒 ESQUEMA DE LA TIENDA (Lo que faltaba) ---
const ShopItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '📦' },
    price: { type: Number, required: true },
    tipo: { type: String, default: 'fijo' },
    categoria: { type: String, default: 'VARIOS' } // Se guarda la sección (HERRAMIENTAS, etc)
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const ShopItem = mongoose.models.ShopItem || mongoose.model('ShopItem', ShopItemSchema);

// --- 📉 FUNCIONES DE USUARIO ---
async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    return user;
}

async function updateUserData(userId, data) {
    try {
        if (data.health <= 0) {
            let oldData = await User.findOne({ userId });
            if (oldData && oldData.health > 0) data.deadCount = (data.deadCount || 0) + 1;
            data.wallet = 0;
        }
        await User.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
        return true;
    } catch (err) { return false; }
}

async function addXP(userId, amount, client) {
    let user = await getUserData(userId);
    let multiplicador = 1; 
    const rango = (user.premiumType || 'none').toLowerCase();

    if (rango === 'ultra' || rango === 'bimestral') multiplicador = 2.0;
    else if (rango === 'pro' || rango === 'mensual') multiplicador = 1.5;

    const xpFinal = Math.floor(amount * multiplicador);
    user.xp += xpFinal;
    const nextLevelXP = user.level * 500;

    if (user.xp >= nextLevelXP) {
        user.level += 1;
        user.xp -= nextLevelXP; 
        await user.save();
        return { leveledUp: true, level: user.level };
    }
    await user.save();
    return { leveledUp: false };
}

// --- 🛒 FUNCIONES DE LA TIENDA (Arreglado) ---

// Obtener todos los ítems guardados
async function getShopItemsDB() {
    try {
        return await ShopItem.find({});
    } catch (e) {
        console.error("Error al obtener ítems:", e);
        return [];
    }
}

// Guardar o actualizar un ítem
async function updateShopItemDB(id, itemData) {
    try {
        await ShopItem.findOneAndUpdate({ id }, { $set: itemData }, { upsert: true });
        return true;
    } catch (err) {
        console.error("Error en updateShopItemDB:", err);
        return false;
    }
}

// Eliminar un ítem
async function deleteShopItemDB(id) {
    try {
        await ShopItem.findOneAndDelete({ id });
        return true;
    } catch (err) {
        console.error("Error en deleteShopItemDB:", err);
        return false;
    }
}

// 🚀 EXPORTACIONES COMPLETAS
module.exports = { 
    User, 
    ShopItem,
    getUserData, 
    updateUserData, 
    addXP, 
    getShopItemsDB,
    updateShopItemDB,
    deleteShopItemDB
};
