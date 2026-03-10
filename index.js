const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDB } = require('./data/mongodb.js');
const { checkNekos } = require('./functions/checkNekos.js');
require('dotenv').config();

// --- 🌐 SERVIDOR PARA RENDER (Evita el error de puertos) ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rockstar Bot está activo 🐾');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`==> Puerto ${PORT} abierto.`));

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

// --- 📂 CARGA DE COMANDOS CON DETECCIÓN DE DUPLICADOS ---
const commands = [];
const uniqueSlashNames = new Set();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('--- 🛠️ Iniciando Carga de Comandos ---');

for (const file of commandFiles) {
    try {
        const filePath = `./commands/${file}`;
        // Borramos el caché para evitar lecturas antiguas
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        // 1. Registro para Comandos de Texto (!!)
        if (command.name) {
            client.commands.set(command.name, command);
        }

        // 2. Registro para Comandos Slash (/)
        if (command.data && command.data.name) {
            if (uniqueSlashNames.has(command.data.name)) {
                // 🚨 ¡AQUÍ ESTÁ EL AVISO! 
                console.error(`\n[ALERTA DUPLICADO] El comando Slash "/${command.data.name}" ya existe.`);
                console.error(`> Archivo conflictivo: "${file}"`);
                console.error(`> ACCIÓN: Borra el archivo "${file}" en Visual Studio y haz git push.\n`);
                continue; // Saltamos este archivo para que no rompa el registro de Discord
            }

            commands.push(command.data.toJSON());
            uniqueSlashNames.add(command.data.name);
        }
    } catch (error) {
        console.error(`❌ Error cargando ${file}:`, error);
    }
}

// --- ⚡ REGISTRO DE SLASH COMMANDS EN DISCORD ---
client.once('ready', async () => {
    console.log(`✅ Rockstar logueado como ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log(`⏳ Sincronizando ${commands.length} comandos con Discord...`);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✨ Menú de comandos "/" actualizado con éxito.');
    } catch (error) {
        console.error('❌ Error crítico al registrar comandos:', error);
    }
});

// --- 💬 MANEJO DE MENSAJES (!! y Mizuki) ---
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

// --- ⚡ MANEJO DE INTERACCIONES (Slash y Solas) ---
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
            await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);