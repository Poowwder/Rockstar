const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
// 🚀 NUEVO: Importamos el motor de experiencia
const { addXP } = require('./userManager.js'); 
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

// --- 📂 CARGA DE COMANDOS CON VALIDACIÓN ---
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('--- 🛠️ Cargando Comandos ---');

for (const file of commandFiles) {
    try {
        const filePath = `./commands/${file}`;
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        // Registro para comandos Slash y de Prefijo
        if (command.name) {
            client.commands.set(command.name, command);
        }
        // Si el comando tiene data (Slash), usamos el nombre de data.name para el mapa
        if (command.data && command.data.name) {
            client.commands.set(command.data.name, command);
        }

    } catch (error) {
        console.error(`\n🚨 ERROR CRÍTICO EN EL ARCHIVO: [${file}]`);
        console.error(`Mensaje: ${error.message}\n`);
    }
}

// --- ⚡ EVENTO: CLIENTREADY ---
client.once(Events.ClientReady, (c) => { 
    console.log(`✅ Rockstar logueado como ${c.user.tag}`);
    console.log('🚀 Bot listo para recibir interacciones.');
});

// --- 💬 EVENTO: MESSAGE (Prefijo !!, Actividad y EXPERIENCIA) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- 📈 SISTEMA DE EXPERIENCIA PASIVA ---
    // Da entre 15 y 25 XP por cada mensaje enviado en el servidor
    const xpGained = Math.floor(Math.random() * 11) + 15; 
    const levelStatus = await addXP(message.author.id, xpGained, client);
    
    // Si subió de nivel, lo anunciamos en el canal
    if (levelStatus.leveledUp) {
        message.channel.send(`> ✨ Las sombras reconocen tu esfuerzo, <@${message.author.id}>. Has ascendido al **Nivel ${levelStatus.level}**.`);
    }

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                await cmd.execute(message, args);
                await checkNekos(message, 'message');
            } catch (e) { console.error(e); }
            return;
        }
    }
    
    await checkNekos(message, 'message');
});

// --- ⚡ EVENTO: INTERACTION (Comandos / y Autocompletado) ---
client.on('interactionCreate', async interaction => {
    
    // --- 🔍 NUEVO: MANEJADOR DE AUTOCOMPLETADO (Para /reaction) ---
    if (interaction.isAutocomplete()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd || !cmd.autocomplete) return;
        try {
            await cmd.autocomplete(interaction);
        } catch (error) {
            console.error("Error en autocompletado:", error);
        }
        return; // Terminamos aquí para que no siga leyendo
    }

    // --- 💬 MANEJADOR DE SLASH COMMANDS ---
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
        await checkNekos(interaction, 'message');

        const acciones = ['kiss', 'hug', 'pat', 'slap', 'kill', 'cuddle', 'punch', 'feed', 'bite'];
        if (acciones.includes(interaction.commandName)) {
            await checkNekos(interaction, 'action');
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ Las sombras interfirieron con este comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
