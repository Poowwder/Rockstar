require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- Keep-Alive para Render ---
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
}).listen(port, () => console.log(`Keep-Alive server running on port ${port}`));
// ------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const prefix = '!!';
client.prefix = prefix;

// Colección para comandos
client.commands = new Collection();

// Cargar comandos desde ./commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        // Soporte para cargar múltiples comandos desde un solo archivo (Array)
        if (Array.isArray(command)) {
            for (const cmd of command) {
                client.commands.set(cmd.data.name, cmd);
            }
        } else {
            client.commands.set(command.data.name, command);
        }
    } catch (error) {
        console.error(`[ERROR] No se pudo cargar el comando ${file}:`, error.message);
    }
}

// Cargar eventos desde ./events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
}

// Registrar comandos slash al iniciar
client.once(Events.ClientReady, async () => {
    // Filtramos los comandos que tienen skipSlash: true para no saturar el límite de 100
    const slashCommands = client.commands.filter(cmd => !cmd.skipSlash).map(cmd => cmd.data.toJSON());
    console.log(`Registrando ${slashCommands.length} comandos slash...`);
    await client.application.commands.set(slashCommands);
    console.log(`Bot listo como ${client.user.tag}`);
});

// Manejo de comandos con prefijo
client.on(Events.MessageCreate, async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Blocked user check
    const blockedUsersPath = path.join(__dirname, 'blockedUsers.json');
    if (fs.existsSync(blockedUsersPath)) {
        const blockedUsers = JSON.parse(fs.readFileSync(blockedUsersPath, 'utf8'));
        if (blockedUsers[message.guild.id]?.includes(message.author.id)) return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
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

// Manejo de comandos slash y menús/botones de ayuda
client.on(Events.InteractionCreate, async interaction => {
    try {
        // Blocked user check
        if (interaction.guild) {
            const blockedUsersPath = path.join(__dirname, 'blockedUsers.json');
            if (fs.existsSync(blockedUsersPath)) {
                const blockedUsers = JSON.parse(fs.readFileSync(blockedUsersPath, 'utf8'));
                if (blockedUsers[interaction.guild.id]?.includes(interaction.user.id)) return;
            }
        }

        // Slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No se encontró el comando ${interaction.commandName}.`);
                return;
            }
            await command.executeSlash(interaction);
            return;
        }

        // Menú de Selección del help (dinámico)
        if (interaction.isStringSelectMenu() && interaction.customId === 'help-menu') {
            const categoria = interaction.values[0];

            const allCategoryCommands = client.commands.filter(cmd => cmd.category === categoria);
            const masterCommand = allCategoryCommands.find(cmd => cmd.data.options?.some(opt => opt.toJSON().type === 1)); // 1 = SUB_COMMAND

            let description;
            let commandCount = 0;

            if (masterCommand) {
                // Si encontramos un comando maestro (con subcomandos), lo mostramos
                const subcommands = masterCommand.data.options.filter(opt => opt.toJSON().type === 1);
                description = subcommands
                    .map(sub => `\`/${masterCommand.data.name} ${sub.name}\` - ${sub.description}`)
                    .join('\n');
                commandCount = subcommands.length;
            } else {
                // Si no, mostramos los comandos individuales de la categoría
                description = allCategoryCommands.size > 0
                    ? allCategoryCommands.map(cmd => {
                        const desc = cmd.description || cmd.data?.description || 'Sin descripción disponible.';
                        return `\`/${cmd.data.name}\` - ${desc}`;
                    }).join('\n')
                    : 'No hay comandos en esta categoría.';
                commandCount = allCategoryCommands.size;
            }

            // Fallback para asegurar que la descripción nunca esté vacía
            if (!description || description.trim() === '') {
                description = 'No se encontraron comandos para esta categoría o está en construcción.';
            }

            const catInfo = categoriasTexto.find(c => c.key === categoria);

            const embed = new EmbedBuilder()
                .setTitle(`Categoría: ${catInfo ? catInfo.label : categoria}`)
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .setDescription(description)
                .setFooter({ text: `Total: ${commandCount} comandos.` });

            // Usamos update para mantener el menú y solo cambiar el contenido del embed
            await interaction.update({ embeds: [embed], components: interaction.message.components });
            return;
        }

        // Botón de cerrar del help
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