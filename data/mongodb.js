const mongoose = require('mongoose');

// --- CONFIGURACIÓN DE SERVIDORES ---
const GuildConfigSchema = new mongoose.Schema({
    GuildID: { type: String, required: true, unique: true },
    Prefix: { type: String, default: '!!' },
    LogChannelID: String,
    // Bienvenidas y Despedidas
    Welcome1Config: { channelId: String, title: String, desc: String, image: String },
    Welcome2Config: { channelId: String, desc: String },
    ByeConfig: { channelId: String, title: String, desc: String, image: String },
    // Roles Automáticos
    userRoleId: String,
    botRoleId: String
});

// --- SISTEMA DE SUGERENCIAS (ANTI-SPAM) ---
const SuggestionSchema = new mongoose.Schema({
    MessageID: String,
    GuildID: String,
    AuthorID: String,
    UpVoters: { type: [String], default: [] },
    DownVoters: { type: [String], default: [] }
});

const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', GuildConfigSchema);
const Suggestion = mongoose.models.Suggestion || mongoose.model('Suggestion', SuggestionSchema);

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

module.exports = { GuildConfig, Suggestion, connectDB };