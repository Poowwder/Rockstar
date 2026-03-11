const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
const { addXP } = require('./userManager.js'); 
require('dotenv').config();

// --- 🌐 SERVIDOR KEEP-ALIVE ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rockstar Bot está en línea 🌑 Nightfall Edition');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[🌐] Puerto ${PORT} abierto.`));

// --- 🤖 CONFIGURACIÓN DEL CLIENTE ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const prefix = "!!";

// Conexión a Base de Datos
connectDB();

// --- 📂 CARGA DE COMANDOS ---
console.log('--- 🛠️ CARGANDO COMANDOS ---');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const filePath = `./commands/${file}`;
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        const cmdName = command.name || (command.data && command.data.name);
        
        if (cmdName) {
            client.commands.set(cmdName, command);
            console.log(`[📦] ${cmdName} cargado.`);
        }
    } catch (error) {
        console.error(`🚨 Error en ${file}: ${error.message}`);
    }
}

// --- 📂 CARGA DE EVENTOS (Auto-Role, Bienvenidas, etc.) ---
console.log('--- 🎭 CARGANDO EVENTOS ---');
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[✨] Evento cargado: ${event.name}`);
}

client.once(Events.ClientReady, (c) => { 
    console.log(`✅ Rockstar operativo: ${c.user.tag}`);
});

// --- 💬 EVENTO: MESSAGE (XP y Comandos de Prefijo) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- 📈 SISTEMA DE XP CON EVENTOS ---
    try {
        let multiXP = 1;
        const activePath = './data/activeEvent.json';
        if (fs.existsSync(activePath)) {
            const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
            if (ev.type === 'xp') multiXP = ev.multiplier; // Bonus si el evento es de XP
        }

        const xpGained = Math.floor((Math.random() * 11) + 15) * multiXP; 
        const levelStatus = await addXP(message.author.id, xpGained, client);
        
        if (levelStatus && levelStatus.leveledUp) {
            message.channel.send(`> ✨ Las sombras reconocen tu ascenso, <@${message.author.id}>. Eres **Nivel ${levelStatus.level}**.`);
        }
    } catch (err) { console.error("Error en XP:", err); }

    // --- ⌨️ MANEJADOR DE PREFIJO ---
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd && cmd.execute) {
            try { await cmd.execute(message, args); } catch (e) { console.error(e); }
        }
    }
    
    await checkNekos(message, 'message');
});

// --- ⚡ EVENTO: INTERACTION (Slash, Modals, Buttons) ---
client.on('interactionCreate', async interaction => {
    // 1. Comandos de Barra (Slash)
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;
        try {
            // Soporte para archivos con execute o executeSlash
            const run = cmd.executeSlash || cmd.execute;
            await run(interaction);
        } catch (e) { console.error(e); }
    }

    // 2. Autocompletado
    if (interaction.isAutocomplete()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd && cmd.autocomplete) await cmd.autocomplete(interaction);
    }
});

client.login(process.env.TOKEN);
