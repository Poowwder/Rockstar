const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
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

// --- ⚡ EVENTO: CLIENTREADY (Limpio de Deploy) ---
client.once(Events.ClientReady, (c) => { 
    console.log(`✅ Rockstar logueado como ${c.user.tag}`);
    console.log('🚀 Bot listo para recibir interacciones.');
});

// --- 💬 EVENTO: MESSAGE (Prefijo !! y Actividad) ---
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

// --- ⚡ EVENTO: INTERACTION (Comandos /) ---
client.on('interactionCreate', async interaction => {
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
            await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);