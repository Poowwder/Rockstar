const mongoose = require('mongoose');

// --- CONFIGURACIÓN DE SERVIDORES ---
const GuildConfigSchema = new mongoose.Schema({
    GuildID: { type: String, required: true, unique: true },
    Prefix: { type: String, default: '!!' },
    LogChannelID: String,
    Welcome1Config: { channelId: String, title: String, desc: String, image: String },
    Welcome2Config: { channelId: String, desc: String },
    ByeConfig: { channelId: String, title: String, desc: String, image: String },
    userRoleId: String,
    botRoleId: String
});

// --- SISTEMA DE SUGERENCIAS ---
const SuggestionSchema = new mongoose.Schema({
    MessageID: String,
    GuildID: String,
    AuthorID: String,
    UpVoters: { type: [String], default: [] },
    DownVoters: { type: [String], default: [] }
});

// --- 🐱 PERFILES DE USUARIO (Para los Nekos Coleccionables) ---
const UserProfileSchema = new mongoose.Schema({
    UserID: { type: String, required: true },
    GuildID: { type: String, required: true },
    Nekos: { type: [String], default: [] }, // Aquí se guardan los emojis/insignias
    Reputation: { type: Number, default: 0 }
});
// Índice único para que un usuario tenga un perfil por servidor
UserProfileSchema.index({ UserID: 1, GuildID: 1 }, { unique: true });

const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', GuildConfigSchema);
const Suggestion = mongoose.models.Suggestion || mongoose.model('Suggestion', SuggestionSchema);
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    try {
        const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
        await mongoose.connect(uri);
        console.log('🍃 MongoDB Conectado (Motor en /data) ✨');
    } catch (err) {
        console.error('❌ Error de conexión:', err);
    }
}

// Exportamos también el UserProfile
module.exports = { GuildConfig, Suggestion, UserProfile, connectDB };