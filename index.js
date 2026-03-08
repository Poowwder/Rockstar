const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { getUserData, updateUserData } = require('./economyManager.js');

// 1. Configuración del Cliente con Partials para las Reacciones
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// 2. Carga de Comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

// 3. Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 Conectado a MongoDB Atlas con éxito'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 4. Evento: Bot Listo
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} está online y vigilando Rockstar Bot!`);
});

// 5. Evento: Manejo de Mensajes (Contador y Comandos)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // --- SISTEMA DE ESTADÍSTICAS Y MASCOTAS ---
    let data = await getUserData(message.author.id);
    if (data) {
        data.messageCount += 1;

        // Logro Mascota 3: 5,000 Mensajes
        if (data.messageCount === 5000) {
            data.inventory.set("Búho Erudito 🦉", 1);
            message.author.send("✨ ¡Increíble! Has escrito 5,000 mensajes y desbloqueaste al **Búho Erudito** en tu perfil.").catch(() => {});
        }

        // Logro Mascota 2: Nivel 10
        if (data.level >= 10 && !data.inventory.has("Zorro Maestro 🦊")) {
            data.inventory.set("Zorro Maestro 🦊", 1);
        }

        await updateUserData(message.author.id, data);
    }

    // --- MANEJO DE COMANDOS ---
    const prefix = "!!";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('❌ Hubo un error al ejecutar ese comando.');
    }
});

// 6. Evento: Manejo de Reacciones (Mascota 1)
client.on('messageReactionAdd', async (reaction, user) => {
    // Si la reacción está en un mensaje no guardado en caché, la descargamos
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error al descargar el mensaje de la reacción:', error);
            return;
        }
    }

    if (user.bot) return;

    let data = await getUserData(user.id);
    if (data) {
        data.reactionCount += 1;

        // Logro Mascota 1: 100 Reacciones
        if (data.reactionCount === 100) {
            data.inventory.set("Mapache Curioso 🦝", 1);
            user.send("✨ ¡Felicidades! Por reaccionar 100 veces has desbloqueado al **Mapache Curioso** en tu perfil.").catch(() => {});
        }

        await updateUserData(user.id, data);
    }
});

// 7. Login del Bot
client.login(process.env.TOKEN);

const http = require('http');

// Crear un servidor básico para que Render no se apague
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Rockstar Bot está online y saludable! 🌸');
  res.end();
}).listen(process.env.PORT || 10000); 

console.log("🌐 Servidor de mantenimiento activado para Render.");