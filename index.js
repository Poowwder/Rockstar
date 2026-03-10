require('dotenv').config();
const { 
    Client, GatewayIntentBits, Collection, EmbedBuilder, 
    Events, ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');

// --- 🌸 CONFIGURACIÓN DE RED (PARA RENDER) ---
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('🌸 Rockstar Online ✨'));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 [RED] Servidor activo en puerto ${PORT}`));

// --- 🛠️ INICIALIZACIÓN DEL BOT ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences,
    ],
});

client.commands = new Collection();

// --- 📂 MODELOS DE MONGODB ---
// Prefijos personalizados
const PrefixSchema = new mongoose.Schema({ GuildID: String, Prefix: { type: String, default: '!!' } });
const PrefixModel = mongoose.models.Prefix || mongoose.model('Prefix', PrefixSchema);

// --- 📂 CARGA DINÁMICA DE COMANDOS ---
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

// --- 📅 CARGA DINÁMICA DE EVENTOS (BIENVENIDAS, ETC) ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    console.log(`📅 [SISTEMA] ${eventFiles.length} eventos registrados.`);
}

// --- 🚀 EVENTO: READY (SINCRONIZACIÓN) ---
client.once(Events.ClientReady, async (c) => {
    console.log('-------------------------------------------');
    console.log(`✅ [SESIÓN] ¡Bot en línea! | ${c.user.tag}`);
    
    // Sincroniza Slash Commands y evita duplicados
    const slashCommands = client.commands.filter(cmd => cmd.data).map(cmd => cmd.data.toJSON());
    await client.application.commands.set(slashCommands);
    
    console.log(`🔄 [SISTEMA] Slash Commands actualizados.`);
    console.log('-------------------------------------------');
});

// --- 🎮 EVENTO: INTERACCIONES (SLASH /) ---
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (command.executeSlash) await command.executeSlash(interaction);
        else if (command.execute) await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const msg = { content: '❌ Error al ejecutar el comando.', ephemeral: true };
        interaction.replied || interaction.deferred ? await interaction.followUp(msg) : await interaction.reply(msg);
    }
});

// --- ✨ EVENTO: MENSAJES (PREFIJO DINÁMICO Y MENCIÓN) ---
client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;

    // 1. Obtener Prefijo Local de la DB
    let data = await PrefixModel.findOne({ GuildID: m.guild.id });
    const prefix = data ? data.Prefix : "!!";

    // 2. Respuesta a Mención Directa
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (m.content.match(mentionRegex)) {
        const guildEmojis = m.guild.emojis.cache.filter(e => e.available);
        const rndEmoji = guildEmojis.size > 0 ? guildEmojis.random().toString() : '🌸';
        return m.reply(`${rndEmoji} Mi prefijo en este servidor es \`${prefix}\`\nPrueba usando \`${prefix}help\`.`);
    }

    // 3. Lógica de Prefijo
    if (!m.content.startsWith(prefix)) return;

    const args = m.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { await cmd.execute(m, args); } catch (e) { console.error(e); }
    }
});

// --- 💎 CONEXIÓN MONGODB ---
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose.connect(mongoURI)
    .then(() => console.log('🍃 [DATABASE] MongoDB Conectado ✨'))
    .catch(e => console.error('❌ [DATABASE] Error:', e.message));

// --- 🎟️ LOGIN ---
client.login(process.env.TOKEN).catch(err => console.error("❌ [LOGIN] Fallo:", err.message));

// Prevenir que el bot se apague por errores no capturados
process.on('unhandledRejection', error => console.error('❌ ERROR GLOBAL:', error));