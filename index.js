require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. SERVIDOR PARA RENDER (Evita el Port Scan Timeout)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Rockstar Bot Online 🌸');
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
    try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Obtener nombre (prioriza data.name de Slash)
        const cmdName = (command.data && command.data.name) ? command.data.name : command.name;

        if (cmdName) {
            client.commands.set(cmdName, command);
            console.log(`✅ Comando cargado: ${cmdName}`);

            // Solo añadir a la lista de registro si tiene 'data' válida y NOMBRE
            if (command.data && command.data.name) {
                slashCommands.push(command.data.toJSON());
            }
        } else {
            console.warn(`⚠️ El archivo ${file} no tiene un nombre definido y será ignorado.`);
        }
    } catch (error) {
        console.error(`❌ Error cargando el archivo ${file}:`, error.message);
    }
}

// 4. REGISTRO DE SLASH COMMANDS EN DISCORD
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        if (slashCommands.length > 0) {
            console.log(`🚀 Sincronizando ${slashCommands.length} Slash Commands...`);
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: slashCommands }
            );
            console.log('✨ ¡Slash Commands registrados con éxito!');
        }
    } catch (error) {
        console.error('❌ Error crítico en el registro de Slash Commands:', error);
    }
})();

// 5. MANEJADOR DE INTERACCIONES (Slash /)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Error al ejecutar el Slash Command.', ephemeral: true }).catch(() => null);
    }
});

// 6. MANEJADOR DE PREFIJO (!!)
client.on('messageCreate', async (message) => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        // Pasamos el mensaje completo para que detecte author.id
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("❌ Hubo un error ejecutando el comando.");
    }
});

client.once('ready', () => console.log(`💖 Sesión iniciada como ${client.user.tag}`));
client.login(process.env.TOKEN);