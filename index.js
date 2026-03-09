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
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => res.send('🌸 Rockstar Online ✨'));
app.listen(PORT, () => console.log(`🚀 [PASO 1] Servidor web activo en puerto ${PORT}`));

// --- 🛠️ INICIALIZACIÓN DEL BOT ---
const OWNER_ID = '1134261491745493032'; 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// --- 📂 AUTO-CREADOR DE CARPETAS ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// --- 🚀 EVENTOS DE CONEXIÓN ---
client.once(Events.ClientReady, (c) => {
    console.log('-------------------------------------------');
    console.log(`✅ [PASO 4] ¡LOGIN EXITOSO!`);
    console.log(`🌸 Bot conectado como: ${c.user.tag} ✨`);
    console.log('-------------------------------------------');
});

// --- 🎟️ INTENTO DE LOGIN (EL GPS) ---
console.log("⏳ [PASO 2] Intentando conectar a Discord...");

if (!process.env.TOKEN) {
    console.error("❌ ERROR: La variable TOKEN está vacía en Render.");
} else {
    // Intentamos el login y capturamos CUALQUIER respuesta
    client.login(process.env.TOKEN)
        .then(() => console.log("🎟️ [PASO 3] Discord recibió el Token correctamente."))
        .catch(err => {
            console.error("❌ [ERROR DE DISCORD] No se pudo iniciar sesión:");
            console.error(err.message);
            if (err.message.includes("privileged intent")) {
                console.error("💡 REVISA: Los 3 botones azules (Intents) en el portal de Discord.");
            }
        });
}

// --- 💎 CONEXIÓN MONGO (DESPUÉS DEL LOGIN) ---
if (process.env.MONGO_USER && process.env.MONGO_PASS) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER || 'cluster0.hahdjvx.mongodb.net'}/${process.env.MONGO_DB || 'Rockstar'}?retryWrites=true&w=majority`;
    mongoose.connect(uri, { family: 4 })
        .then(() => console.log('🍃 [DATABASE] MongoDB Conectado ✨'))
        .catch(e => console.error('❌ [DATABASE] Error en Mongo:', e.message));
}

// --- 🛠️ CARGA DE ARCHIVOS EXTERNOS ---
let emojis = {};
let userManager;

try {
    emojis = require('./utils/emojiHelper.js');
    userManager = require('./userManager.js');
    console.log("📦 [SISTEMA] Archivos de utilidad cargados.");
} catch (e) {
    console.warn("⚠️ [SISTEMA] Error cargando utilidades (Check paths):", e.message);
}

// --- 🎀 CARGA DE COMANDOS ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            const cmdName = command.data ? command.data.name : command.name;
            if (cmdName) client.commands.set(cmdName, command);
        } catch (e) { console.error(`⚠️ Error en comando [${file}]:`, e.message); }
    }
}

// --- ✨ EVENTO: MENSAJES ---
client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;

    // Lógica de XP simplificada para evitar bloqueos
    if (userManager && userManager.addXP) {
        try {
            const xpRandom = Math.floor(Math.random() * 11) + 10; 
            const levelUp = await userManager.addXP(m.author.id, xpRandom, client);
            if (levelUp?.leveledUp) {
                m.reply(`✨ **¡Level Up!** Nivel **${levelUp.level}** 🎀`);
            }
        } catch (e) { console.error("Error XP:", e.message); }
    }

    if (!m.content.startsWith("!!")) return;
    const args = m.content.slice(2).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { await cmd.execute(m, args); } catch (e) { console.error(e.message); }
    }
});

// Captura de errores globales para que Render no muera
process.on('unhandledRejection', error => {
    console.error('❌ ERROR NO MANEJADO:', error);
});