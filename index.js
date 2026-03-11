const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
const { addXP, getUserData } = require('./userManager.js'); 
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rockstar Bot está en línea 🐾');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT);

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

connectDB();

// --- 📂 CARGA DE COMANDOS ---
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const filePath = `./commands/${file}`;
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        if (command.name) client.commands.set(command.name, command);
        if (command.data && command.data.name) client.commands.set(command.data.name, command);
    } catch (error) {
        console.error(`🚨 ERROR EN: [${file}] - ${error.message}`);
    }
}

client.once(Events.ClientReady, (c) => { 
    console.log(`✅ Rockstar logueado como ${c.user.tag}`);
});

// --- 💬 EVENTO: MESSAGE (XP y Prefijo) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- 📈 SISTEMA DE EXPERIENCIA PASIVA ---
    const xpGained = Math.floor(Math.random() * 11) + 15; 
    const levelStatus = await addXP(message.author.id, xpGained, client);
    
    if (levelStatus && levelStatus.leveledUp) {
        message.channel.send(`> ✨ Las sombras reconocen tu esfuerzo, <@${message.author.id}>. Has ascendido al **Nivel ${levelStatus.level}**.`);
    }

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                // ✅ Solo se ejecuta el comando. Adiós al checkNekos doble.
                await cmd.execute(message, args);
            } catch (e) { 
                console.error(e); 
            }
            return; // Detiene el código para que no baje al escáner pasivo
        }
    }
    
    // ✅ Solo se ejecuta si el usuario mandó un mensaje normal (sin prefijo !! o si el comando no existe)
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
        // ✅ Solo ejecuta el Slash Command. Limpiamos toda la basura duplicada.
        await cmd.execute(interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ Las sombras interfirieron con este comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
