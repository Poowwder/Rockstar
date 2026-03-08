const mongoose = require('mongoose');

// Esquema de Usuario (La estructura de los datos)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    guildId: { type: String },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    inventory: { type: Map, of: Number, default: {} },
    lastDaily: { type: Date },
    lastRob: { type: Date },
    lastChatXP: { type: Date },
    profileColor: { type: String, default: '#FFB6C1' },
    marryId: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error MongoDB:', err));

async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId });
        await user.save();
    }
    return user;
}

async function updateUserData(userId, newData) {
    // MongoDB maneja los cambios automáticamente si pasas el objeto del modelo
    if (newData.save) {
        return await newData.save();
    }
    return await User.findOneAndUpdate({ userId }, newData, { upsert: true, new: true });
}

module.exports = { getUserData, updateUserData };