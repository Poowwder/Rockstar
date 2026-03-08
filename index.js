require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Crear el Servidor para Render (Evita el Port Scan Timeout)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Rockstar Bot está online! 🌸');
  res.end();
}).listen(process.env.PORT || 10000);

// 2. Configurar el Cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 3. Cargar Comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    }
}

// 4. Evento de Inicio (Corregido para v14/v15)
client.once('ready', (c) => {
    console.log(`✅ ${c.user.tag} está online y vigilando Rockstar Bot!`);
    
    // Estado aesthetic
    client.user.setPresence({
        activities: [{ name: '!!help | 🌸 Rockstar Bot', type: 0 }],
        status: 'online',
    });
});

// 5. Manejador de Mensajes
client.on('messageCreate', async (message) => {
    const prefix = "!!"; // Tu prefijo personalizado

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Buscar comando por nombre o alias
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Ups, algo salió mal')
            .setDescription('Hubo un error al ejecutar ese comando. ¡Inténtalo de nuevo más tarde! ✨');
        
        message.reply({ embeds: [errorEmbed] });
    }
});

// 6. Login
client.login(process.env.TOKEN);