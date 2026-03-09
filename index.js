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

// --- 🛠️ CONFIGURACIÓN INICIAL ---
const OWNER_ID = '1134261491745493032'; 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// --- 🌸 SERVIDOR WEB (Para Render) ---
const app = express();
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => res.send('🌸 Rockstar Online ✨'));
app.listen(PORT, () => console.log(`🚀 Servidor web activo en puerto ${PORT}`));

// --- 📂 AUTO-CREADOR DE CARPETAS Y ARCHIVOS ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// --- 🚀 EVENTO DE ENCENDIDO ---
client.once(Events.ClientReady, (c) => {
    console.log('-------------------------------------------');
    console.log(`✅ ¡POR FIN! El bot está vivo.`);
    console.log(`🌸 Conectado como: ${c.user.tag} ✨`);
    console.log('-------------------------------------------');
});

// --- 🎟️ LOGIN PRINCIPAL (CON MANEJO DE ERRORES) ---
console.log("⏳ Intentando conectar a Discord...");

if (!process.env.TOKEN) {
    console.error("❌ ERROR: No se encontró la variable TOKEN en Render.");
} else {
    client.login(process.env.TOKEN).catch(err => {
        console.error("❌ ERROR CRÍTICO AL CONECTAR A DISCORD:");
        console.error(`Mensaje: ${err.message}`);
        if (err.message.includes("used an invalid token")) {
            console.error("💡 Sugerencia: El token en Render es incorrecto o fue anulado. Haz 'Reset Token' en Discord.");
        }
    });
}

// --- 🛠️ IMPORTACIONES Y CARGA (DESPUÉS DEL LOGIN) ---
// Usamos try-catch para que si un archivo falta, el bot no se apague
let emojis = {};
try {
    emojis = require('./utils/emojiHelper.js');
    console.log("✅ EmojiHelper cargado.");
} catch (e) {
    console.warn("⚠️ Advertencia: No se pudo cargar emojiHelper.js");
}

let userManager;
try {
    userManager = require('./userManager.js');
    console.log("✅ UserManager cargado.");
} catch (e) {
    console.warn("⚠️ Advertencia: No se pudo cargar userManager.js");
}

client.commands = new Collection();

// --- 💎 CONEXIÓN MONGO ---
if (process.env.MONGO_USER && process.env.MONGO_PASS) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER || 'cluster0.hahdjvx.mongodb.net'}/${process.env.MONGO_DB || 'Rockstar'}?retryWrites=true&w=majority`;
    mongoose.connect(uri, { family: 4 })
        .then(() => console.log('🍃 MongoDB Conectado ✨'))
        .catch(e => console.error('❌ Error en Mongo:', e.message));
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
        } catch (e) { 
            console.error(`⚠️ Error en comando [${file}]:`, e.message); 
        }
    }
}

// --- ✨ EVENTO: INTERACCIONES ---
client.on(Events.InteractionCreate, async (i) => {
    if (i.isChatInputCommand()) {
        const cmd = client.commands.get(i.commandName);
        if (cmd) {
            try {
                if (cmd.executeSlash) await cmd.executeSlash(i);
                else if (cmd.execute) await cmd.execute(i, i.options);
            } catch (e) { console.error(e); }
        }
    }
    // (Aquí puedes añadir la lógica de botones y modales que tenías antes)
});

// --- ✨ EVENTO: MENSAJES (XP & Economía) ---
client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild || !userManager) return;

    try {
        const xpRandom = Math.floor(Math.random() * 11) + 10; 
        const levelUp = await userManager.addXP(m.author.id, xpRandom, client);

        if (levelUp && levelUp.leveledUp) {
            m.reply(`${emojis.pinkstars || '✨'} **¡Level Up!** Ahora eres nivel **${levelUp.level}** ${emojis.pinkbow || '🎀'}`);
        }
    } catch (e) {
        console.error("Error en sistema de XP:", e.message);
    }

    if (!m.content.startsWith("!!")) return;
    const args = m.content.slice(2).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { await cmd.execute(m, args); } catch (e) { console.error(e.message); }
    }
});

// Evitar crasheos por errores no capturados
process.on('unhandledRejection', error => {
    console.error('❌ Error no manejado:', error);
});