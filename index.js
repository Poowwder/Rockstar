require('dotenv').config();
const { 
    Client, GatewayIntentBits, Collection, EmbedBuilder, 
    Events, ModalBuilder, TextInputBuilder, TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');

// --- 🛠️ IMPORTACIONES PROPIAS ---
const emojis = require('./utils/emojiHelper.js'); 
const { getUserData, updateUserData, grantNeko, addXP } = require('./userManager.js');

const OWNER_ID = '1134261491745493032'; // 👑 Tu ID de creadora

// --- 📂 AUTO-CREADOR DE ARCHIVOS DATA ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
['config.json', 'warnings.json', 'mutes.json'].forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// --- 🌸 SERVIDOR WEB (Para Render) ---
const app = express();
app.get('/', (req, res) => res.send('🌸 Rockstar Online ✨'));
app.listen(process.env.PORT || 8080);

client.commands = new Collection();

// --- 💎 CONEXIÓN MONGO ---
if (process.env.MONGO_USER && process.env.MONGO_PASS) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_CLUSTER || 'cluster0.hahdjvx.mongodb.net'}/${process.env.MONGO_DB || 'Rockstar'}?retryWrites=true&w=majority`;
    mongoose.connect(uri, { family: 4 })
        .then(() => console.log('🍃 MongoDB Conectado ✨'))
        .catch(e => console.error('❌ Mongo:', e.message));
}

// --- 🎀 CARGA DE COMANDOS ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            const cmdName = command.data ? command.data.name : command.name;
            if (cmdName) client.commands.set(cmdName, command);
        } catch (e) { 
            console.error(`⚠️ Error en [${file}]:`, e.message); 
        }
    }
}

// --- ✨ EVENTO: INTERACCIONES (Slash & Botones) ---
client.on(Events.InteractionCreate, async (i) => {
    const configPath = path.join(__dirname, './data/config.json');

    // 1. Slash Commands
    if (i.isChatInputCommand()) {
        const cmd = client.commands.get(i.commandName);
        if (cmd) {
            try {
                if (cmd.executeSlash) await cmd.executeSlash(i);
                else if (cmd.execute) await cmd.execute(i, i.options);
            } catch (e) { console.error(e); }
        }
    }

    // 2. Botones
    if (i.isButton()) {
        if (i.customId === 'admin_settings') {
            if (i.user.id !== OWNER_ID) return i.reply({ content: '🌸 Solo mi creadora puede usar esto.', ephemeral: true });

            const modal = new ModalBuilder().setCustomId('modal_config').setTitle('🎨 Configurar Más Info');
            const txt = new TextInputBuilder().setCustomId('in_text').setLabel('Descripción').setStyle(TextInputStyle.Paragraph).setRequired(true);
            const col = new TextInputBuilder().setCustomId('in_col').setLabel('Color Hex (Ej: #FFB6C1)').setStyle(TextInputStyle.Short).setValue('#FFB6C1');
            
            modal.addComponents(new ActionRowBuilder().addComponents(txt), new ActionRowBuilder().addComponents(col));
            return await i.showModal(modal);
        }

        if (i.customId === 'view_info') {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}');
            const embed = new EmbedBuilder()
                .setTitle('🎀 Información del Sistema')
                .setDescription(config.infoMessage || "🌸 No hay información configurada aún.")
                .setColor(config.mainColor || '#FFB6C1')
                .setFooter({ text: 'Rockstar System ✨' });
            await i.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // 3. Modales
    if (i.isModalSubmit() && i.customId === 'modal_config') {
        const text = i.fields.getTextInputValue('in_text');
        const color = i.fields.getTextInputValue('in_col');
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}');
        config.infoMessage = text;
        config.mainColor = color;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        await i.reply({ content: '✅ Configuración guardada correctamente. ✨', ephemeral: true });
    }
});

// --- ✨ EVENTO: MENSAJES (XP & Economía) ---
client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;

    try {
        // 1. Lógica de XP y Niveles
        const xpRandom = Math.floor(Math.random() * 11) + 10; // 10-20 XP
        const levelUp = await addXP(m.author.id, xpRandom, client);

        if (levelUp && levelUp.leveledUp) {
            m.reply(`${emojis.pinkstars || '✨'} **¡Level Up!** Ahora eres nivel **${levelUp.level}** ${emojis.pinkbow || '🎀'}`);
        }

        // 2. Lógica de Mensajes para Neko Mizuki
        const data = await getUserData(m.author.id);
        const totalMensajes = (data.messageCount || 0) + 1;
        await updateUserData(m.author.id, { messageCount: totalMensajes });

        if (totalMensajes === 5000) {
            await grantNeko(m.author.id, 'mizuki', client);
        }
    } catch (e) {
        console.error("Error en sistema de XP/Mensajes:", e.message);
    }

    // 3. Comandos con Prefijo (!!)
    if (!m.content.startsWith("!!")) return;
    const args = m.content.slice(2).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd && cmd.execute) {
        try { 
            await cmd.execute(m, args); 
        } catch (e) { 
            console.error(`Error en comando ${cmdName}:`, e.message); 
        }
    }
});

client.once(Events.ClientReady, (c) => console.log(`🌸 ${c.user.tag} ONLINE ✨`));
client.login(process.env.TOKEN);