const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { connectDB } = require('./data/mongodb.js'); 
const { checkNekos } = require('./functions/checkNekos.js');
const http = require('http'); // Necesario para Render
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER (Solución al error de puertos) ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Rockstar Bot está encendido y brillando 🐾');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`==> Escaneando puerto ${PORT}: Rockstar listo para Render.`);
});

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

// Conexión a la base de datos
connectDB();

// --- 📂 CARGA DE COMANDOS ---
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (Array.isArray(command)) {
        command.forEach(cmd => client.commands.set(cmd.name, cmd));
    } else {
        client.commands.set(command.name, command);
    }
}

// --- ⚡ EVENTO: INTERACTION CREATE ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // Ejecución del comando
        if (typeof cmd.executeSlash === 'function') {
            await cmd.executeSlash(interaction);
        } else if (typeof cmd.execute === 'function') {
            await cmd.execute(interaction);
        }

        // --- 📊 CONTEO AUTOMÁTICO DE HITOS (SOLAS & MIZUKI) ---
        
        // 1. Mizuki: Conteo de comandos usados (Actividad general)
        await checkNekos(interaction, 'message');

        // 2. Solas: Conteo de acciones (Solo comandos de interacción con otros)
        const listaAcciones = ['kiss', 'hug', 'pat', 'slap', 'kill', 'cuddle', 'punch', 'feed', 'bite'];
        const esAccion = listaAcciones.includes(interaction.commandName) || (cmd.category && cmd.category.toLowerCase() === 'accion');
        
        const target = interaction.options.getUser('usuario') || interaction.options.getUser('user') || interaction.options.getUser('target');

        if (esAccion && target && target.id !== interaction.user.id && !target.bot) {
            await checkNekos(interaction, 'action');
        }

    } catch (error) {
        console.error('Error en interacción:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '✨ Se ha producido un error al procesar esta solicitud.', ephemeral: true });
        }
    }
});

// --- 💬 EVENTO: MESSAGE CREATE (MIZUKI) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    
    // Sumar mensaje para el hito Mizuki
    await checkNekos(message, 'message');
});

// --- 🚀 LOGIN ---
client.login(process.env.TOKEN);