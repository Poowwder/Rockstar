require('dotenv').config();
const { 
    Client, GatewayIntentBits, Collection, EmbedBuilder, 
    Events, ModalBuilder, TextInputBuilder, TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');

// --- 🌸 CONFIGURACIÓN DE RED (PARA RENDER) ---
const app = express();
const PORT = process.env.PORT || 10000; // Render prefiere el 10000
app.get('/', (req, res) => res.send('🌸 Rockstar Online ✨'));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 [PASO 1] Servidor web activo en puerto ${PORT}`));

// --- 🛠️ INICIALIZACIÓN DEL BOT (CON TODOS LOS INTENTS) ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences, // Vital para desbloquear el login
    ],
});

client.commands = new Collection();

// --- 🚀 EVENTO DE CONEXIÓN EXITOSA ---
client.once(Events.ClientReady, (c) => {
    console.log('-------------------------------------------');
    console.log(`✅ [PASO 4] ¡LOGRADO! Bot en línea.`);
    console.log(`🌸 Conectado como: ${c.user.tag} ✨`);
    console.log('-------------------------------------------');
});

// --- 🎟️ INTENTO DE LOGIN CON TIMEOUT ---
console.log("⏳ [PASO 2] Enviando señal a Discord...");

const loginToken = process.env.TOKEN;

if (!loginToken || loginToken.trim() === "") {
    console.error("❌ ERROR: La variable TOKEN está vacía o tiene espacios en Render.");
} else {
    // Ponemos un temporizador: si en 15 segundos no hay respuesta, avisamos.
    const timeout = setTimeout(() => {
        console.warn("⚠️ ALERTA: Discord está tardando demasiado en responder. Revisa los 'Intents' en el Developer Portal.");
    }, 15000);

    client.login(loginToken)
        .then(() => {
            clearTimeout(timeout);
            console.log("🎟️ [PASO 3] Token validado. Esperando confirmación de Ready...");
        })
        .catch(err => {
            clearTimeout(timeout);
            console.error("❌ [ERROR DE DISCORD] Fallo inmediato:");
            console.error(err.message);
        });
}

// --- 💎 CONEXIÓN MONGO ---
if (process.env.MONGO_USER && process.env.MONGO_PASS) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER || 'cluster0.hahdjvx.mongodb.net'}/${process.env.MONGO_DB || 'Rockstar'}?retryWrites=true&w=majority`;
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
        .then(() => console.log('🍃 [DATABASE] MongoDB Conectado ✨'))
        .catch(e => console.error('❌ [DATABASE] Error en Mongo:', e.message));
}

// --- 📂 CARGA DE COMANDOS Y UTILIDADES ---
try {
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            const cmdName = command.data ? command.data.name : command.name;
            if (cmdName) client.commands.set(cmdName, command);
        }
        console.log(`📦 [SISTEMA] ${client.commands.size} comandos cargados.`);
    }
} catch (e) {
    console.error("⚠️ [SISTEMA] Error cargando comandos:", e.message);
}

// --- ✨ EVENTO: MENSAJES (XP & ECONOMÍA) ---
client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;

    // Prefijo !!
    if (!m.content.startsWith("!!")) return;
    const args = m.content.slice(2).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { 
            await cmd.execute(m, args); 
        } catch (e) { 
            console.error(`Error en comando ${cmdName}:`, e.message); 
        }
    }
});

// --- 🛡️ PREVENCIÓN DE CRASH ---
process.on('unhandledRejection', error => {
    console.error('❌ ERROR GLOBAL (No manejado):', error);
});