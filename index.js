require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. SERVIDOR PARA RENDER (Evita el "Port Scan Timeout")
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Rockstar Bot está vivo! 🌸');
    res.end();
}).listen(process.env.PORT || 10000);

// 2. CONFIGURACIÓN DEL CLIENTE
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const slashCommands = [];

// 3. CARGA DINÁMICA DE COMANDOS
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Registramos por nombre (para prefijo)
    const cmdName = command.name || (command.data ? command.data.name : null);
    if (cmdName) {
        client.commands.set(cmdName, command);
        console.log(`✨ Comando cargado: ${cmdName}`);
    }

    // Registramos para Slash Commands (si tiene la propiedad data)
    if (command.data) {
        slashCommands.push(command.data.toJSON());
    }
}

// 4. REGISTRO DE SLASH COMMANDS EN DISCORD
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🚀 Registrando Slash Commands en la API...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Asegúrate de tener CLIENT_ID en tu .env
            { body: slashCommands }
        );
        console.log('✅ Slash Commands registrados con éxito.');
    } catch (error) {
        console.error('❌ Error al registrar Slash Commands:', error);
    }
})();

// 5. EVENTO READY
client.once('ready', () => {
    console.log(`💖 Logueada como ${client.user.tag}`);
});

// 6. MANEJADOR DE SLASH COMMANDS (Interacciones)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Error al ejecutar el Slash Command.', ephemeral: true });
    }
});

// 7. MANEJADOR DE PREFIJO (!!)
client.on('messageCreate', async (message) => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        // Ejecutamos pasando el "message" como si fuera la "interaction"
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("❌ Error al ejecutar el comando de prefijo.");
    }
});

client.login(process.env.TOKEN);