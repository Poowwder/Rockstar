require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- Keep-Alive para Render ---
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot está vivo!');
}).listen(port, () => console.log(`Servidor Keep-Alive corriendo en el puerto ${port}`));
// ------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.prefix = '!!';
client.commands = new Collection();

// --- Command Loader ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandOrCommands = require(filePath);

    if (Array.isArray(commandOrCommands)) {
        // Handle files exporting an array of commands
        for (const command of commandOrCommands) {
            if (command.data && command.data.name) {
                client.commands.set(command.data.name, command);
                console.log(`Comando cargado: ${command.data.name}`);
            }
        }
    } else if (commandOrCommands.data && commandOrCommands.data.name) {
        // Handle files exporting a single command object
        client.commands.set(commandOrCommands.data.name, commandOrCommands);
        console.log(`Comando cargado: ${commandOrCommands.data.name}`);
    }
}


// --- Event Loader ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- Client Ready ---
client.once(Events.ClientReady, async () => {
    try {
        const slashCommands = client.commands.map(cmd => cmd.data.toJSON());
        console.log(`Registrando ${slashCommands.length} comandos slash...`);
        await client.application.commands.set(slashCommands);
        console.log(`Bot listo como ${client.user.tag}`);
    } catch (error) {
        console.error('Error al registrar comandos slash:', error);
    }
});

// --- MessageCreate (Prefix Commands) ---
client.on(Events.MessageCreate, async message => {
    if (!message.content.startsWith(client.prefix) || message.author.bot) return;

    // Blocked user check
    const blockedUsersPath = path.join(__dirname, 'data', 'blockedUsers.json');
    if (fs.existsSync(blockedUsersPath)) {
        const blockedUsers = JSON.parse(fs.readFileSync(blockedUsersPath, 'utf8'));
        if (blockedUsers[message.guild.id]?.includes(message.author.id)) return;
    }

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al ejecutar el comando.');
    }
});

const { categoriasTexto } = require('./constants.js');

// --- InteractionCreate (Slash Commands & Components) ---
client.on(Events.InteractionCreate, async interaction => {
    try {
        // Blocked user check
        const blockedUsersPath = path.join(__dirname, 'data', 'blockedUsers.json');
        if (interaction.guild && fs.existsSync(blockedUsersPath)) {
            const blockedUsers = JSON.parse(fs.readFileSync(blockedUsersPath, 'utf8'));
            if (blockedUsers[interaction.guild.id]?.includes(interaction.user.id)) return;
        }

        // Slash Command Handling
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No se encontró el comando ${interaction.commandName}.`);
                return;
            }
             // Asegurarse de que `executeSlash` exista
            if (command.executeSlash) {
                await command.executeSlash(interaction);
            } else {
                // Fallback o error si el comando no está preparado para slash
                await interaction.reply({ content: 'Este comando no está disponible como comando de barra.', ephemeral: true });
            }
            return;
        }

        // --- Component Handling ---

        // Help Menu
        if (interaction.isStringSelectMenu() && interaction.customId === 'help-menu') {
            const categoria = interaction.values[0];
            const allCategoryCommands = client.commands.filter(cmd => cmd.category === categoria);

            let description = allCategoryCommands.map(cmd => {
                const desc = cmd.description || cmd.data?.description || 'Sin descripción disponible.';
                return `\`/${cmd.data.name}\` - ${desc}`;
            }).join('\n');

            if (!description) {
                description = 'No hay comandos en esta categoría o está en construcción.';
            }

            const catInfo = categoriasTexto.find(c => c.key === categoria);
            const embed = new EmbedBuilder()
                .setTitle(`Categoría: ${catInfo ? catInfo.label : categoria}`)
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .setDescription(description)
                .setFooter({ text: `Total: ${allCategoryCommands.size} comandos.` });

            await interaction.update({ embeds: [embed], components: interaction.message.components });
            return;
        }

        // Help Close Button
        if (interaction.isButton() && interaction.customId === 'help-close') {
            await interaction.message.delete();
            return;
        }

    } catch (error) {
        console.error('Error en el manejador de interacciones:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al procesar esta interacción.', flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: 'Hubo un error al procesar esta interacción.', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

client.login(process.env.TOKEN);