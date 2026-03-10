const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { connectDB } = require('./data/mongodb.js'); 
const { checkNekos } = require('./functions/checkNekos.js');
const http = require('http');
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER (Solución Port Scan) ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Rockstar Bot está en línea 🐾');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT);

// --- 🤖 CONFIGURACIÓN ---
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

// Conexión a la base de datos
connectDB();

// --- 📂 CARGA Y REGISTRO DE COMANDOS ---
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    
    // Si el comando tiene estructura Slash, lo preparamos para registrarlo
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

// --- ⚡ EVENTO: READY (Registrar Slash Commands) ---
client.once('ready', async () => {
    console.log(`✅ Rockstar logueado como ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('⏳ Registrando comandos slash...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✨ Comandos slash registrados con éxito.');
    } catch (error) {
        console.error('❌ Error al registrar slash:', error);
    }
});

// --- 💬 EVENTO: MESSAGE CREATE (Comandos !! y Actividad) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // 1. Lógica de Prefijo (!!help, !!profile, etc.)
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                await cmd.execute(message, args);
                // Sumar actividad solo si el comando existe
                await checkNekos(message, 'message');
            } catch (e) { console.error(e); }
            return;
        }
    }

    // 2. Si es un mensaje normal, sumar actividad para Mizuki
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
        
        // Sumar actividad
        await checkNekos(interaction, 'message');

        // Lógica de Solas (Acciones)
        const listaAcciones = ['kiss', 'hug', 'pat', 'slap', 'kill', 'cuddle', 'punch', 'feed', 'bite'];
        if (listaAcciones.includes(interaction.commandName)) {
            await checkNekos(interaction, 'action');
        }

    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);