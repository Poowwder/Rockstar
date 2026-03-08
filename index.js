require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Importaciones de gestores
const { getUserData, updateUserData, getAllData } = require('./economyManager.js');
const { addXP } = require('./levelManager.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

client.commands = new Collection();
const commandsJSON = [];
const PREFIX = '!';
const configPath = path.join(__dirname, './data/config.json');

// --- 1. CARGA DE COMANDOS (CON VALIDACIÓN ANTI-ERRORES) ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    
    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const cmd = require(filePath);

            // Verificamos que el comando tenga la estructura mínima requerida
            if (cmd && cmd.data && cmd.data.name && typeof cmd.execute === 'function') {
                client.commands.set(cmd.data.name, cmd);
                commandsJSON.push(cmd.data.toJSON());
                console.log(`✅ Comando cargado: ${file}`);
            } else {
                console.warn(`⚠️ El archivo ${file} no tiene la estructura de comando correcta (falta data, name o execute).`);
            }
        } catch (error) {
            console.error(`❌ Error al cargar el archivo ${file}:`, error);
        }
    }
}

// --- 2. FUNCIÓN PARA ENVIAR LOGS ---
async function sendLog(guild, embed) {
    if (!fs.existsSync(configPath)) return;
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel) logChannel.send({ embeds: [embed] });
    } catch (e) { console.log("Error al leer config de logs"); }
}

// --- 3. ANTI-SPAM MEMORY ---
const spamMap = new Map();

// --- 4. EVENTO READY ---
client.once('ready', async () => {
    console.log(`🚀 Rockstar Bot conectado como ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('⏳ Registrando Slash Commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsJSON });
        console.log('✅ Comandos registrados globalmente.');
    } catch (e) { console.error('❌ Error al registrar Slash Commands:', e); }
});

// --- 5. EVENTO MESSAGE (ANTI-SPAM, XP, PREFIJO) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;

    // A. Lógica Anti-Spam
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMessage: now };
        
        if (now - userData.lastMessage < 2000) userData.count++;
        else userData.count = 1;

        userData.lastMessage = now;
        spamMap.set(userId, userData);

        if (userData.count > 5) {
            try {
                await message.member.timeout(60000, "Spam detectado");
                message.channel.send(`⚠️ ${message.author}, silenciado 1 min por spam.`);
                spamMap.delete(userId);
                return;
            } catch (e) { console.log("Fallo al mutear (Jerarquía)"); }
        }
    }

    // B. Chat XP
    let data = await getUserData(userId);
    const now = Date.now();
    if (now - (data.lastChatXP || 0) > 60000) {
        data.lastChatXP = now;
        await updateUserData(userId, data);
        // Enviamos 2 XP base (levelManager aplica x5, x10 o x15)
        await addXP(userId, 2, { channel: message.channel, guild: message.guild, user: message.author }, { getUserData, updateUserData });
    }

    // C. Comandos con Prefijo (!)
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    // Adaptador para comandos Slash usados con prefijo
    const interactionLike = {
        isChatInputCommand: () => true,
        user: message.author,
        guild: message.guild,
        channel: message.channel,
        member: message.member,
        options: {
            getString: (n) => args[0] || null,
            getUser: () => message.mentions.users.first() || null,
            getInteger: () => parseInt(args[0]) || null,
            getNumber: () => parseFloat(args[0]) || null
        },
        reply: (c) => message.reply(c),
        followUp: (c) => message.channel.send(c)
    };

    try { await command.execute(interactionLike); } catch (e) { console.error(e); }
});

// --- 6. EVENTO INTERACTION (Slash Commands) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); } catch (e) { console.error(e); }
});

// --- 7. EVENTOS DE AUDITORÍA (LOGS) ---
client.on('messageUpdate', (oldM, newM) => {
    if (oldM.author?.bot || oldM.content === newM.content) return;
    const embed = new EmbedBuilder().setTitle('📝 Mensaje Editado').setColor('#FFA500').setTimestamp()
        .addFields({ name: 'Autor', value: `${oldM.author}`, inline: true }, { name: 'Antes', value: oldM.content || "Vacío" }, { name: 'Después', value: newM.content || "Vacío" });
    sendLog(oldM.guild, embed);
});

client.on('messageDelete', (m) => {
    if (m.author?.bot) return;
    const embed = new EmbedBuilder().setTitle('🗑️ Mensaje Borrado').setColor('#FF0000').setTimestamp()
        .addFields({ name: 'Autor', value: `${m.author}`, inline: true }, { name: 'Contenido', value: m.content || "Imagen/Embed" });
    sendLog(m.guild, embed);
});

client.on('guildMemberAdd', m => {
    sendLog(m.guild, new EmbedBuilder().setTitle('🌸 Bienvenida').setDescription(`${m} se unió.`).setColor('#00FF00').setThumbnail(m.user.displayAvatarURL()));
});

client.on('guildMemberRemove', m => {
    sendLog(m.guild, new EmbedBuilder().setTitle('💔 Despedida').setDescription(`${m.user.tag} salió.`).setColor('#808080'));
});

// --- 8. BUCLE DE SUBASTAS AUTOMÁTICAS ---
setInterval(async () => {
    const allUsers = await getAllData();
    const now = Date.now();
    for (const user of allUsers) {
        if (user.activeAuction && now > user.activeAuction.endsAt) {
            let seller = await getUserData(user.userId);
            if (user.activeAuction.highestBidder) {
                let buyer = await getUserData(user.activeAuction.highestBidder);
                buyer.inventory[user.activeAuction.item] = (buyer.inventory[user.activeAuction.item] || 0) + 1;
                seller.wallet += user.activeAuction.currentBid;
                await updateUserData(user.activeAuction.highestBidder, buyer);
            } else {
                seller.inventory[user.activeAuction.item] = (seller.inventory[user.activeAuction.item] || 0) + 1;
            }
            delete seller.activeAuction;
            await updateUserData(user.userId, seller);
        }
    }
}, 60000);

client.login(process.env.TOKEN);