const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 1. INICIALIZACIÓN (Esto arregla el ReferenceError) ✨
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// 2. CARGA DE COMANDOS 📂
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) {
        client.commands.set(command.name, command);
        console.log(`✨ Cargado: ${command.name}`);
    }
}

// 3. MANEJADOR DE INTERACCIONES (SLASH COMMANDS) 🚀
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // Pasamos interaction y options para compatibilidad
        await cmd.execute(interaction, interaction.options); 
    } catch (error) {
        console.error(`❌ Error en Slash ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '╰┈➤ 🌸 ¡Ups! Hubo un error interno, linda.', ephemeral: true });
        }
    }
});

// 4. MANEJADOR DE MENSAJES (PREFIX COMMANDS) 🎀
client.on('messageCreate', async (message) => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd) {
        try {
            await cmd.execute(message, args);
        } catch (error) {
            console.error(`❌ Error en Prefix ${cmdName}:`, error);
            message.reply("╰┈➤ 🌸 Ocurrió un error al procesar este comando.");
        }
    }
});

// 5. EVENTO READY ✨
client.once('ready', () => {
    console.log(`🌸 ¡Bot encendido! Logueado como ${client.user.tag}`);
    client.user.setActivity('!!help | Harem Mode 💍', { type: 3 });
});

// 6. LOGIN (Final del archivo) 🔐
// Render leerá el TOKEN de tus variables de entorno (Environment Variables)
client.login(process.env.TOKEN);