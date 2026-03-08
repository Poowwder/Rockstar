const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// CONEXIÓN MONGO
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🌸 MongoDB: Conectado ✨'))
    .catch(err => console.error('❌ Error Mongo:', err));

// CARGA DE COMANDOS
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) {
        client.commands.set(command.name, command);
    }
}

// EVENTO SLASH
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
        await cmd.execute(interaction, interaction.options); 
    } catch (error) {
        console.error(`❌ ERROR SLASH [${interaction.commandName}]:`, error);
        if (!interaction.replied) await interaction.reply({ content: '🌸 Ups, error interno, linda.', ephemeral: true });
    }
});

// EVENTO PREFIX
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
            console.error(`❌ ERROR PREFIX [${cmdName}]:`, error);
            message.reply("🌸 Ocurrió un error al procesar este comando... ✨");
        }
    }
});

client.once('ready', () => console.log(`🌸 ${client.user.tag} ONLINE ✨`));

// --- ESCUDOS GLOBALES ---
process.on('unhandledRejection', (reason) => console.error('⚠️ ERROR GLOBAL:', reason));
process.on('uncaughtException', (err) => console.error('⚠️ EXCEPCIÓN GLOBAL:', err));

client.login(process.env.TOKEN);