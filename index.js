require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, Events } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');
const emojis = require('./utils/emojiHelper.js'); 

// --- 📂 AUTO-CREADOR DE ARCHIVOS DATA (Nuevo) ---
const dataDir = path.join(__dirname, 'data');
const requiredFiles = ['config.json', 'warnings.json', 'mutes.json'];

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Carpeta "data" creada con éxito. ✨');
}

requiredFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
        console.log(`📄 Archivo "${file}" generado automáticamente. ✨`);
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// --- 🔍 BUSCADOR AUTOMÁTICO DE MANAGER ---
let userControl = { getUserData: () => ({}), updateUserData: () => ({}), grantNeko: () => ({}) };
const posiblesNombres = ['./economyManager.js', './userManager.js'];
let cargado = false;

for (const nombre of posiblesNombres) {
    try {
        if (fs.existsSync(path.join(__dirname, nombre))) {
            userControl = require(nombre);
            console.log(`✅ Manager detectado y cargado como: ${nombre} ✨`);
            cargado = true;
            break;
        }
    } catch (e) {}
}
if (!cargado) console.log('⚠️ Aviso: No se encontró economyManager ni userManager.');

const { getUserData, updateUserData, grantNeko } = userControl;

// --- 🌸 SERVIDOR WEB ---
const app = express();
app.get('/', (req, res) => res.send('🌸 Bot Rockstar Online ✨'));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor web en puerto ${PORT}`));

client.commands = new Collection();

// --- 💎 CONEXIÓN MONGO ---
const { MONGO_USER, MONGO_PASS, MONGO_CLUSTER, MONGO_DB } = process.env;
if (MONGO_USER && MONGO_PASS) {
    const cluster = MONGO_CLUSTER || 'cluster0.hahdjvx.mongodb.net';
    const db = MONGO_DB || 'Rockstar';
    const uri = `mongodb+srv://${MONGO_USER}:${encodeURIComponent(MONGO_PASS)}@${cluster}/${db}?retryWrites=true&w=majority`;
    
    mongoose.connect(uri, { family: 4 })
        .then(() => console.log('🍃 MongoDB Atlas: Conexión establecida con éxito. ✨'))
        .catch(err => console.error('❌ Error Mongo:', err.message));
}

// --- 🎀 CARGA DE COMANDOS ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            const cmdName = command.data ? command.data.name : command.name;
            if (cmdName) client.commands.set(cmdName, command);
        } catch (error) {
            console.error(`⚠️ Error en comando [${file}]:`, error.message);
        }
    }
}

// --- ✨ EVENTOS ---
client.on(Events.InteractionCreate, async (i) => {
    if (i.isChatInputCommand()) {
        const cmd = client.commands.get(i.commandName);
        if (cmd) {
            try { 
                // Detecta si es el comando maestro (executeSlash) o uno normal (execute)
                if (cmd.executeSlash) await cmd.executeSlash(i);
                else if (cmd.execute) await cmd.execute(i, i.options); 
            } catch (e) { console.error(e); }
        }
    }
    if (i.isButton()) {
        const res = {
            'join_giveaway': `${emojis.pinkbow} **¡Ya estás participando!** ${emojis()}`,
            'view_list': `${emojis()} **Consultando la lista...**`,
            'confirm_reset': `${emojis.exclamation} **Base de datos reseteada.**`,
            'cancel_reset': `${emojis.pinkbow} **Acción cancelada.**`
        };
        if (res[i.customId]) {
            const method = i.customId.includes('reset') ? 'update' : 'reply';
            await i[method]({ content: res[i.customId], embeds: [], components: [], ephemeral: true });
        }
    }
});

client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;
    try {
        const data = await getUserData(m.author.id);
        const total = (data.messageCount || 0) + 1;
        await updateUserData(m.author.id, { messageCount: total });
        if (total === 5000) await grantNeko(m.author.id, 'mizuki', client);
    } catch (e) {}

    if (!m.content.startsWith("!!")) return;
    const args = m.content.slice(2).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { await cmd.execute(m, args); } catch (e) { m.reply("🌸 Error en el comando."); }
    }
});

client.once(Events.ClientReady, (c) => console.log(`🌸 ${c.user.tag} ONLINE ✨`));

process.on('unhandledRejection', r => console.error('⚠️ RECHAZO:', r));
process.on('uncaughtException', e => console.error('⚠️ EXCEPCIÓN:', e));

client.login(process.env.TOKEN);