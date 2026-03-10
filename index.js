const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs'); 
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

connectDB();

// --- 📂 CARGA DE COMANDOS (Con filtro de duplicados) ---
const commands = [];
const commandNames = new Set(); // Para rastrear nombres ya usados
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    
    // Función interna para procesar cada comando
    const processCommand = (cmd) => {
        client.commands.set(cmd.name, cmd);
        
        // Solo añadimos al registro Slash si tiene data y NO es un nombre duplicado
        if (cmd.data && !commandNames.has(cmd.data.name)) {
            commands.push(cmd.data.toJSON());
            commandNames.add(cmd.data.name);
        } else if (cmd.data && commandNames.has(cmd.data.name)) {
            console.warn(`⚠️ Aviso: Se omitió el duplicado Slash del comando: ${cmd.data.name} (Archivo: ${file})`);
        }
    };

    if (Array.isArray(command)) {
        command.forEach(cmd => processCommand(cmd));
    } else {
        processCommand(command);
    }
}

// --- ⚡ EVENTO: CLIENTREADY (Corregido para v14/v15) ---
client.once('ready', async () => {
    console.log(`✅ Rockstar logueado como ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log(`⏳ Sincronizando ${commands.length} comandos slash únicos...`);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✨ Registro completado sin duplicados.');
    } catch (error) {
        console.error('❌ Error crítico en el registro:', error);
    }
});

// --- 💬 EVENTO: MESSAGE CREATE (Comandos !! y Actividad) ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

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

// --- ⚡ EVENTO: INTERACTION CREATE (Comandos /) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
        await checkNekos(interaction, 'message');

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