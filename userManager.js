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
    harem: { type: Array, default: [] }, 
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

// ✅ ACTUALIZACIÓN ROBUSTA (Arregla el inventario invisible)
async function updateUserData(userId, data) {
    try {
        let user = await User.findOne({ userId });
        if (!user) user = await User.create({ userId });

        // 💀 LÓGICA DE MUERTE Y RENACIMIENTO
        // Si la salud es 0 (como en tu captura) o menos, activamos la purga y revivimos
        if (data.health <= 0) {
            const rank = (user.premiumType || 'none').toLowerCase();
            const inv = user.inventory || {};
            const newInv = { ...inv };

            let lossPercentage = rank.includes('ultra') ? 0.05 : rank.includes('pro') ? 0.10 : 0.15;
            let livesLoss = rank.includes('ultra') ? 2 : rank.includes('pro') ? 0.35 : 0.50;

            for (let itemId in newInv) {
                if (newInv[itemId] <= 0) continue;
                if (itemId === 'vida') {
                    if (rank.includes('ultra')) newInv[itemId] = Math.max(0, newInv[itemId] - livesLoss);
                    else newInv[itemId] = Math.max(0, Math.floor(newInv[itemId] * (1 - livesLoss)));
                } else {
                    newInv[itemId] = Math.max(0, Math.floor(newInv[itemId] * (1 - lossPercentage)));
                }
            }

            // Aplicamos los cambios de muerte
            user.inventory = newInv;
            user.deadCount += 1;
            user.health = 3; // ❤️ Te devolvemos las 3 vidas
            // Limpiamos 'data' para que no sobrescriba la salud a 0 otra vez
            delete data.health;
            delete data.inventory;
        }

        // 🧬 MEZCLAR DATOS NUEVOS
        Object.assign(user, data);

        // 🔥 CRÍTICO: Avisar a la base de datos que el Inventario cambió
        user.markModified('inventory');
        user.markModified('durabilidades');
        user.markModified('harem');

        await user.save();
        return true;
    } catch (err) { 
        console.error("Error al guardar:", err);
        return false; 
    }
}

// ... (getShopItemsDB, updateShopItemDB, deleteShopItemDB se mantienen igual)
async function getShopItemsDB() { try { return await ShopItem.find({}); } catch (e) { return []; } }
async function updateShopItemDB(id, itemData) { try { await ShopItem.findOneAndUpdate({ id }, { $set: itemData }, { upsert: true }); return true; } catch (err) { return false; } }
async function deleteShopItemDB(id) { try { await ShopItem.findOneAndDelete({ id }); return true; } catch (err) { return false; } }

module.exports = { User, ShopItem, getUserData, updateUserData, getShopItemsDB, updateShopItemDB, deleteShopItemDB };
