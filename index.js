const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs'); // ⬅️ Falta esta línea crítica para leer tus comandos
const { connectDB } = require('./data/mongodb.js'); 
const { checkNekos } = require('./functions/checkNekos.js');
const http = require('http');
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Rockstar Bot está en línea y brillando 🐾');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`==> Puerto ${PORT} detectado. Render listo.`);
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
const prefix = "!!";

// Conexión a MongoDB
connectDB();

// --- 📂 CARGA Y REGISTRO DE COMANDOS ---
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    
    // Si el comando es un array (como en algunos sistemas de help)
    if (Array.isArray(command)) {
        command.forEach(cmd => {
            client.commands.set(cmd.name, cmd);
            if (cmd.data) commands.push(cmd.data.toJSON());
        });
    } else {
        client.commands.set(command.name, command);
        if (command.data) commands.push(command.data.toJSON());
    }
}

// --- ⚡ EVENTO: READY (Registrar Slash Commands) ---
client.once('ready', async () => {
    console.log(`✅ Rockstar logueado como ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('⏳ Sincronizando comandos slash con Discord...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✨ Comandos slash registrados con éxito.');
    } catch (error) {
        console.error('❌ Error al registrar slash:', error);
    }
});

// --- 💬 EVENTO: MESSAGE CREATE (Prefijo !! y Actividad) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // 1. Detección de Comandos Legacy (!!)
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                // Ejecutar comando de texto
                await cmd.execute(message, args);
                // Sumar actividad (Mizuki)
                await checkNekos(message, 'message');
            } catch (e) {
                console.error(`Error en comando ${commandName}:`, e);
            }
            return;
        }
    }

    // 2. Mensajes normales (Mizuki)
    await checkNekos(message, 'message');
});

// --- ⚡ EVENTO: INTERACTION CREATE (Comandos /) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // Ejecutar Slash
        await cmd.execute(interaction);
        
        // Sumar actividad general
        await checkNekos(interaction, 'message');

        // Lógica de Solas (Acciones)
        const listaAcciones = ['kiss', 'hug', 'pat', 'slap', 'kill', 'cuddle', 'punch', 'feed', 'bite'];
        if (listaAcciones.includes(interaction.commandName)) {
            await checkNekos(interaction, 'action');
        }

    } catch (error) {
        console.error('Error en Slash Interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '✨ Se ha producido un error al procesar esta solicitud.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);