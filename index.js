const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { GuildConfig, connectDB } = require('./data/mongodb.js'); 
const { checkNekos } = require('./functions/checkNekos.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
connectDB();

// --- CARGA DE COMANDOS ---
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (Array.isArray(command)) {
        command.forEach(cmd => client.commands.set(cmd.name, cmd));
    } else {
        client.commands.set(command.name, command);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // 1. Ejecución del comando
        if (typeof cmd.executeSlash === 'function') {
            await cmd.executeSlash(interaction);
        } else if (typeof cmd.execute === 'function') {
            await cmd.execute(interaction);
        }

        // --- 📊 SISTEMA DE CONTEO AUTOMÁTICO PARA NEKOS ---
        
        // A. Conteo para MIZUKI (Mensajes/Comandos totales)
        await checkNekos(interaction, 'message');

        // B. Conteo para SOLAS (+100 acciones con usuarios)
        // Lista de nombres de comandos que el bot considera "acciones"
        const listaAcciones = ['kiss', 'hug', 'pat', 'slap', 'kill', 'cuddle', 'punch', 'feed', 'bite'];
        
        // Verificamos si es un comando de la lista o si tu sistema de help lo categoriza como acción
        const esAccion = listaAcciones.includes(interaction.commandName) || (cmd.category && cmd.category.toLowerCase() === 'accion');
        
        // Solo cuenta si el usuario ha seleccionado a un objetivo (no a sí mismo ni al bot)
        const target = interaction.options.getUser('usuario') || interaction.options.getUser('user') || interaction.options.getUser('target');

        if (esAccion && target && target.id !== interaction.user.id && !target.bot) {
            await checkNekos(interaction, 'action');
        }

    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Se ha producido un error al procesar esta solicitud.', ephemeral: true });
        }
    }
});

// Conteo de mensajes de texto para Mizuki
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    await checkNekos(message, 'message');
});

client.login(process.env.TOKEN);