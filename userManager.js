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
    
    // 💍 Vínculos y Harén
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

// --- 📉 FUNCIONES DE USUARIO Y EXPERIENCIA ---

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

// --- 💀 EL NÚCLEO: ACTUALIZACIÓN Y MUERTE QUIRÚRGICA ---

async function updateUserData(userId, data) {
    try {
        let oldData = await User.findOne({ userId });
        if (!oldData) oldData = await User.create({ userId });

        // 🛡️ Lógica de Muerte (Mine/Fish) - Solo si pasa de Vivo a Muerto
        if (data.health <= 0 && oldData.health > 0) {
            const rank = (oldData.premiumType || 'none').toLowerCase();
            const inv = oldData.inventory || {};
            const newInv = { ...inv };

            let lossPercentage; // Pérdida de materiales
            let livesLoss;      // Pérdida de ítem "vida"

            // Definición de tasas según el rango
            if (rank === 'ultra' || rank === 'bimestral') {
                lossPercentage = 0.05; // 5% de materiales
                livesLoss = 2;         // -2 vidas fijas
            } else if (rank === 'pro' || rank === 'mensual') {
                lossPercentage = 0.10; // 10% de materiales
                livesLoss = 0.35;      // 35% de vidas compradas
            } else {
                lossPercentage = 0.15; // 15% de materiales
                livesLoss = 0.50;      // 50% de vidas compradas
            }

            // Aplicar la purga al inventario sin tocar dinero
            for (let itemId in newInv) {
                if (newInv[itemId] <= 0) continue;

                if (itemId === 'vida') {
                    // Si es Ultra, resta vidas fijas. Si no, resta porcentaje.
                    if (rank === 'ultra' || rank === 'bimestral') {
                        newInv[itemId] = Math.max(0, newInv[itemId] - livesLoss);
                    } else {
                        newInv[itemId] = Math.max(0, Math.floor(newInv[itemId] * (1 - livesLoss)));
                    }
                } else {
                    // Materiales (hierro, gemas, madera, peces, etc)
                    newInv[itemId] = Math.max(0, Math.floor(newInv[itemId] * (1 - lossPercentage)));
                }
            }

            // Inyectamos los cambios en el objeto data para que se guarden
            data.inventory = newInv;
            data.deadCount = (oldData.deadCount || 0) + 1;
            data.health = 3; // ❤️ Renacimiento automático
            // data.wallet NO se toca (Mine/Fish no quita dinero)
        }

        await User.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
        return true;
    } catch (err) { 
        console.error("Error al actualizar datos de usuario:", err);
        return false; 
    }
}

// --- 🛒 GESTIÓN DE LA TIENDA ---

async function getShopItemsDB() {
    try {
        return await ShopItem.find({});
    } catch (e) {
        return [];
    }
}

async function updateShopItemDB(id, itemData) {
    try {
        await ShopItem.findOneAndUpdate({ id }, { $set: itemData }, { upsert: true });
        return true;
    } catch (err) {
        return false;
    }
}

async function deleteShopItemDB(id) {
    try {
        await ShopItem.findOneAndDelete({ id });
        return true;
    } catch (err) {
        return false;
    }
}

// 🚀 EXPORTACIONES
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
