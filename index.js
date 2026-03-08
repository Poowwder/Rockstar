const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. INICIALIZACIÓN DEL CLIENT ✨
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// 2. CONEXIÓN A MONGODB 🍃
// Esto soluciona el error de IP en Render si ya pusiste 0.0.0.0/0 en Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🌸 ¡Conexión exitosa a MongoDB Atlas! ✨'))
    .catch(err => console.error('❌ Error crítico en MongoDB:', err));

// 3. CARGA DE COMANDOS 📂
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) {
        client.commands.set(command.name, command);
        console.log(`✨ Comando detectado: ${command.name}`);
    }
}

// 4. MANEJADOR DE INTERACCIONES (SLASH COMMANDS) 🚀
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // Pasamos la interacción para que comandos como profile.js la procesen
        await cmd.execute(interaction, interaction.options); 
    } catch (error) {
        console.error(`❌ Error en Slash ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: '╰┈➤ 🌸 ¡Ups! Hubo un error interno, linda. Inténtalo de nuevo. ✨', 
                ephemeral: true 
            });
        }
    }
});

// 5. MANEJADOR DE MENSAJES (PREFIX COMMANDS !!) 🎀
client.on('messageCreate', async (message) => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd) {
        try {
            // Ejecutamos pasando el mensaje y los argumentos
            await cmd.execute(message, args);
        } catch (error) {
            console.error(`❌ Error en Prefix ${cmdName}:`, error);
            message.reply("╰┈➤ 🌸 Ocurrió un error al procesar este comando... ¡Lo siento, reina! ✨");
        }
    }
});

// 6. EVENTO READY 🦢
client.once('ready', () => {
    console.log(`🌸 ¡Bot en línea! Sesión iniciada como ${client.user.tag}`);
    client.user.setActivity('!!help | Coleccionando Harems 💍', { type: 3 }); // Watching
});

// 7. LOGIN SEGURO 🔐
client.login(process.env.TOKEN);