const mongoose = require('mongoose');

const nekoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    activityPoints: { type: Number, default: 0 }, 
    actionPoints: { type: Number, default: 0 },   
    level: { type: Number, default: 1 },
    unlockedNekos: { type: Array, default: [] }, // <-- AQUÍ se guardan los gatitos (Badges)
    lastMessage: { type: Date, default: Date.now }
});

nekoSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Neko', nekoSchema);
