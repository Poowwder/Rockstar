const mongoose = require('mongoose');

const nekoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    activityPoints: { type: Number, default: 0 }, // Puntos por mensajes
    actionPoints: { type: Number, default: 0 },   // Puntos por comandos de acción (hug, kiss)
    level: { type: Number, default: 1 },
    lastMessage: { type: Date, default: Date.now }
});

// Esto evita que se creen duplicados si el usuario ya existe
nekoSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Neko', nekoSchema);