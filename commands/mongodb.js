const mongoose = require('mongoose');

// --- 🗝️ CONEXIÓN AL NÚCLEO ---
// Reemplaza 'TU_MONGO_URI' con tu cadena de conexión real en un archivo .env
const mongoURI = process.env.MONGO_URI || 'TU_MONGO_URI';

mongoose.connect(mongoURI)
    .then(() => console.log('╰┈➤ 🌑 Enlace con el búnker de MongoDB: ESTABLECIDO'))
    .catch((err) => console.error('╰┈➤ ❌ Fallo crítico en el núcleo de datos:', err));

// --- ⚙️ ESQUEMA: CONFIGURACIÓN DEL DOMINIO ---
const GuildConfigSchema = new mongoose.Schema({
    GuildID: { type: String, required: true, unique: true },
    LogChannelID: { type: String, default: null },
    
    // Roles Automáticos
    userRoleId: { type: String, default: null },
    botRoleId: { type: String, default: null },

    // Configuración de Bienvenidas (B1)
    Welcome1Config: {
        channelId: String,
        title: String,
        desc: String,
        image: String,
        color: { type: String, default: '#1a1a1a' }
    },

    // Configuración de Saludos (B2)
    Welcome2Config: {
        channelId: String,
        desc: String
    },

    // Configuración de Despedidas (Bye)
    ByeConfig: {
        channelId: String,
        title: String,
        desc: String,
        image: String,
        color: { type: String, default: '#1a1a1a' },
        timestamp: { type: Boolean, default: true }
    }
});

// --- 💡 ESQUEMA: SISTEMA DE SUGERENCIAS ---
const SuggestionSchema = new mongoose.Schema({
    MessageID: { type: String, required: true },
    GuildID: { type: String, required: true },
    AuthorID: { type: String, required: true },
    UpVoters: { type: [String], default: [] },
    DownVoters: { type: [String], default: [] },
    Status: { type: String, default: 'PENDING' } // PENDING, ACCEPTED, REJECTED
});

// --- ⚠️ ESQUEMA: REGISTRO DE ADVERTENCIAS ---
const WarningSchema = new mongoose.Schema({
    WarnID: { type: String, required: true },
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    ModeratorID: { type: String, required: true },
    Reason: { type: String, required: true },
    Timestamp: { type: Date, default: Date.now }
});

// --- 📦 EXPORTACIÓN DE MODELOS ---
const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', GuildConfigSchema);
const Suggestion = mongoose.models.Suggestion || mongoose.model('Suggestion', SuggestionSchema);
const Warning = mongoose.models.Warning || mongoose.model('Warning', WarningSchema);

module.exports = { GuildConfig, Suggestion, Warning };
