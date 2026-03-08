require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const http = require('http');

// MANTENER VIVO EN RENDER
http.createServer((req, res) => { res.write("Rockstar Online"); res.end(); }).listen(process.env.PORT || 3000);

const { getUserData, updateUserData } = require('./economyManager.js');
const { addXP } = require('./levelManager.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();
const commandsJSON = [];
const PREFIX = '!!'; 

// 1. CARGA DE COMANDOS
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const cmd = require(path.join(commandsPath, file));
            if (cmd.data) {
                client.commands.set(cmd.data.name, cmd);
                commandsJSON.push(cmd.data.toJSON());
            }
        } catch (e) { console.error(`Error cargando ${file}:`, e); }
    }
}

// 2. FUNCIÓN DE LOGS AESTHETIC
async function sendLog(guild, user, embed) {
    const configPath = path.join(__dirname, './data/config.json');
    if (!fs.existsSync(configPath)) return;
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.logChannelId) return;
        const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
        
        if (channel) {
            // Configuración estética común para todos los logs
            const member = guild.members.cache.get(user.id);
            const nickname = member?.nickname || user.username;

            embed.setAuthor({ 
                name: `${nickname} (${user.tag})`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ 
                text: `${guild.name} • Rockstar Audit`, 
                iconURL: guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

            channel.send({ embeds: [embed] });
        }
    } catch (e) { console.log("Error en logs aesthetic:", e); }
}

// 3. EVENTOS DE AUDITORÍA
client.on('messageDelete', async (m) => {
    if (m.author?.bot || !m.guild) return;
    const e = new EmbedBuilder()
        .setTitle('🗑️ Mensaje Eliminado')
        .setColor('#FF4B2B')
        .setDescription(`**Contenido:**\n${m.content || "*Sin texto (posible imagen o embed)*"}`)
        .addFields({ name: '📍 Canal', value: `${m.channel}`, inline: true });
    
    await sendLog(m.guild, m.author, e);
});

client.on('messageUpdate', async (o, n) => {
    if (o.author?.bot || o.content === n.content) return;
    const e = new EmbedBuilder()
        .setTitle('📝 Mensaje Editado')
        .setColor('#FFD93D')
        .addFields(
            { name: '⬅️ Antes', value: o.content || "*Vacío*", inline: false },
            { name: '➡️ Después', value: n.content || "*Vacío*", inline: false },
            { name: '📍 Canal', value: `${o.channel}`, inline: true }
        );
    
    await sendLog(o.guild, o.author, e);
});

client.on('guildMemberAdd', async (m) => {
    const e = new EmbedBuilder()
        .setTitle('🌸 Nueva Llegada')
        .setColor('#6BCB77')
        .setDescription(`¡Bienvenido/a al servidor! Ahora somos **${m.guild.memberCount}** miembros.`);
    
    await sendLog(m.guild, m.user, e);
});

client.on('guildMemberRemove', async (m) => {
    const e = new EmbedBuilder()
        .setTitle('💔 Partida de Miembro')
        .setColor('#4D96FF')
        .setDescription(`${m.user.username} ha dejado el servidor.`);
    
    await sendLog(m.guild, m.user, e);
});

// 4. MANEJO DE MENSAJES (XP & !! PREFIX)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // XP Logic
    let data = await getUserData(message.author.id);
    if (Date.now() - (data.lastChatXP || 0) > 60000) {
        data.lastChatXP = Date.now();
        await updateUserData(message.author.id, data);
        await addXP(message.author.id, 2, { channel: message.channel, guild: message.guild, user: message.author }, { getUserData, updateUserData });
    }

    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (command) {
        const interactionLike = {
            isChatInputCommand: () => true,
            user: message.author,
            guild: message.guild,
            channel: message.channel,
            member: message.member,
            options: {
                getString: () => args[0] || null,
                getUser: () => message.mentions.users.first() || null,
                getInteger: () => parseInt(args[0]) || null,
                getSubcommand: () => args[0] || null,
            },
            reply: (o) => message.reply(o),
            followUp: (o) => message.channel.send(o)
        };
        try { await command.execute(interactionLike); } catch (e) { console.error(e); }
    }
});

// 5. SLASH COMMANDS
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand() && !i.isStringSelectMenu()) return;
    const command = client.commands.get(i.commandName || i.message?.interaction?.commandName);
    if (command) try { await command.execute(i); } catch (e) { console.error(e); }
});

// 6. READY
client.once('ready', async () => {
    const clientId = process.env.CLIENT_ID || client.user.id;
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(clientId), { body: commandsJSON });
        console.log(`✅ Rockstar Aesthetic Logs Activos | Prefijo: ${PREFIX}`);
    } catch (e) { console.error(e); }
});

client.login(process.env.TOKEN);