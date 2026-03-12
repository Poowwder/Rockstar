const { Client, GatewayIntentBits, Collection, Events, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
require('./data/mongodb.js'); // Conexión automática al búnker
const { addXP } = require('./userManager.js'); 
require('dotenv').config();

// --- 🌐 SERVIDOR KEEP-ALIVE ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rockstar Bot 🌑 Nightfall Edition: SISTEMAS OPERATIVOS');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`╰┈➤ [🌐] Puerto ${PORT} abierto.`));

// --- 🤖 CONFIGURACIÓN DEL CLIENTE ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Vital para bienvenidas y logs de miembros
        GatewayIntentBits.GuildMessages, // Vital para logs de borrado/editado
        GatewayIntentBits.MessageContent, // Vital para leer comandos de prefijo
        GatewayIntentBits.GuildModeration // Vital para logs de ban/kick
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User] 
    // Los Partials permiten que el bot detecte eventos en mensajes viejos (logs)
});

client.commands = new Collection();
const prefix = process.env.PREFIX || "!!";

// --- 📂 CARGA DINÁMICA DE COMANDOS ---
console.log('--- 🛠️ SINCRONIZANDO COMANDOS ---');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        const cmdName = command.name || (command.data && command.data.name);
        
        if (cmdName) {
            client.commands.set(cmdName, command);
            console.log(`[📦] Comando cargado: ${cmdName}`);
        }
    } catch (error) {
        console.error(`🚨 Error en el archivo ${file}: ${error.message}`);
    }
}

// --- 📂 CARGA DINÁMICA DE EVENTOS ---
console.log('--- 🎭 SINCRONIZANDO EVENTOS ---');
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    
    // 🛡️ EL ESCUDO: Ignoramos los archivos de utilidad (como embedBuilder.js)
    if (!event.name) {
        console.log(`[⚠️] Archivo de utilidad detectado e ignorado por el bucle: ${file}`);
        continue; 
    }

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[✨] Evento cargado exitosamente: ${event.name}`);
}

// --- 💬 MANEJADOR DE MENSAJES (XP & PREFIJO) ---
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // --- 📈 SISTEMA DE XP ---
    try {
        // Lógica de multiplicador (Eventos de XP)
        let multiXP = 1;
        const activePath = './data/activeEvent.json';
        if (fs.existsSync(activePath)) {
            const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
            if (ev.type === 'xp') multiXP = ev.multiplier;
        }

        const xpGained = Math.floor((Math.random() * 11) + 15) * multiXP; 
        const levelStatus = await addXP(message.author.id, xpGained, client);
        
        if (levelStatus?.leveledUp) {
            message.channel.send(`╰┈➤ ✨ Las sombras reconocen tu ascenso, <@${message.author.id}>. Eres **Nivel ${levelStatus.level}**.`);
        }
    } catch (err) { console.error("Error en sistema de XP:", err); }

    // --- ⌨️ SISTEMA DE PREFIJO ---
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

    if (cmd && cmd.execute) {
        try { 
            await cmd.execute(message, args); 
        } catch (e) { 
            console.error(`Error ejecutando !!${commandName}:`, e);
            message.reply('╰┈➤ ❌ Hubo un error al ejecutar ese comando en las sombras.');
        }
    }
});

// --- ⚡ MANEJADOR DE INTERACCIONES (SLASH / BOTONES / MODALS) ---
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;
        try {
            const run = cmd.executeSlash || cmd.execute;
            await run(interaction);
        } catch (e) { 
            console.error(`Error en /${interaction.commandName}:`, e);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '╰┈➤ ❌ Error ejecutando el comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: '╰┈➤ ❌ Error ejecutando el comando.', ephemeral: true });
            }
        }
    }

    // Aquí es donde procesarás tus botones y modals en el futuro
});

client.login(process.env.TOKEN);
