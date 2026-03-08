require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Servidor para Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Rockstar Bot Online 🌸');
}).listen(process.env.PORT || 10000);

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

// 2. Carga de comandos con detección de errores por archivo
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Determinamos el nombre del comando
        let cmdName = command.name || (command.data ? command.data.name : null);

        if (!cmdName) {
            console.error(`❌ Error en ${file}: No tiene un nombre definido.`);
            continue;
        }

        client.commands.set(cmdName, command);

        // Solo intentamos convertir a JSON si tiene 'data' y un nombre válido en 'data'
        if (command.data && command.data.name) {
            slashCommands.push(command.data.toJSON());
        }
        
        console.log(`✅ Comando cargado: ${cmdName}`);
    } catch (error) {
        console.error(`⚠️ Error crítico cargando el archivo ${file}:`, error.message);
    }
}

// 3. Registro de Slash Commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        if (slashCommands.length > 0) {
            console.log('🚀 Actualizando Slash Commands...');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: slashCommands }
            );
            console.log('✅ Slash Commands sincronizados.');
        }
    } catch (error) {
        console.error('❌ Falló el registro de Slash Commands. Revisa que todos tengan .setName()');
    }
})();

// 4. Manejadores de eventos (Slash y Prefijo)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (command) command.execute(interaction).catch(err => console.error(err));
});

client.on('messageCreate', async message => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    if (command) command.execute(message, args).catch(err => console.error(err));
});

client.once('ready', () => console.log(`💖 ${client.user.tag} lista!`));
client.login(process.env.TOKEN);