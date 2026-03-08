const mongoose = require('mongoose');

// --- CONEXIÓN ÚNICA (Esto evita el lag) ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Atlas: Conexión establecida con éxito.'))
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    premiumType: { type: String, default: 'none' }, // 'none' o 'premium'
    lastDaily: { type: Date, default: null }
});

const User = mongoose.model('User', UserSchema);

// Obtener datos (Cacheado por Mongoose)
async function getUserData(userId) {
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            user = await User.create({ userId });
        }
        return user;
    } catch (err) {
        console.error("Error obteniendo datos:", err);
        return null;
    }
}

// Guardar datos de forma rápida
async function updateUserData(userId, data) {
    try {
        await User.findOneAndUpdate({ userId }, data, { upsert: true });
        return true;
    } catch (err) {
        console.error("Error guardando datos:", err);
        return false;
    }
}

module.exports = { getUserData, updateUserData };