const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
const { addXP } = require('./userManager.js'); 
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER (Keep-Alive) ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rockstar Bot está en línea 🐾');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[🌐] Servidor HTTP activo en puerto ${PORT}`));

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

// --- 📂 CARGA DE COMANDOS CON DETECTOR DE DUPLICADOS ---
console.log('--- 🛠️ INICIANDO CARGA DE COMANDOS ---');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const filePath = `./commands/${file}`;
        // Limpiamos la cache para asegurar que cargue lo más nuevo
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        // Obtenemos el nombre ya sea por prefix (command.name) o slash (command.data.name)
        const cmdName = command.name || (command.data && command.data.name);
        
        if (cmdName) {
            console.log(`[📦] Comando cargado: "${cmdName}" (Archivo: ${file})`);
            client.commands.set(cmdName, command);
        }
    } catch (error) {
        console.error(`🚨 ERROR EN: [${file}] - ${error.message}`);
    }
}
console.log('---------------------------------------');

client.once(Events.ClientReady, (c) => { 
    console.log(`✅ Rockstar logueado como ${c.user.tag}`);
});

// --- 💬 EVENTO: MESSAGE (XP y Prefijo) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- 📈 SISTEMA DE EXPERIENCIA PASIVA ---
    try {
        const xpGained = Math.floor(Math.random() * 11) + 15; 
        const levelStatus = await addXP(message.author.id, xpGained, client);
        
        if (levelStatus && levelStatus.leveledUp) {
            message.channel.send(`> ✨ Las sombras reconocen tu esfuerzo, <@${message.author.id}>. Has ascendido al **Nivel ${levelStatus.level}**.`);
        }
    } catch (err) {
        console.error("Error en XP:", err);
    }

    // --- ⌨️ MANEJADOR DE PREFIJO (!!) ---
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const cmd = client.commands.get(commandName) || 
                    client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                // Ejecución híbrida: pasamos el mensaje completo para que use.js, crime.js, etc., funcionen
                await cmd.execute(message, args);
            } catch (e) { 
                console.error(`Error ejecutando !!${commandName}:`, e); 
            }
            return; 
        }
    }
    
    // Escáner pasivo de Nekos
    await checkNekos(message, 'message');
});

// --- ⚡ EVENTO: INTERACTION (Slash y Autocomplete) ---
client.on('interactionCreate', async interaction => {
    // 🔍 MANEJADOR DE AUTOCOMPLETADO
    if (interaction.isAutocomplete()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd && cmd.autocomplete) {
            try { await cmd.autocomplete(interaction); } catch (e) { console.error(e); }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
    } catch (error) {
        console.error(`Error en Slash Command ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Las sombras interfirieron con este comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
