require('dotenv').config();
const { 
    Client, GatewayIntentBits, Collection, Events, 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType 
} = require('discord.js');
const { connectDB, GuildConfig, Suggestion } = require('./data/mongodb.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// --- MANTENER VIVO EN RENDER ---
const app = express();
app.get('/', (req, res) => res.send('🌸 Rockstar System Online ✨'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

// --- CLIENT CONFIG ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
connectDB();

// --- CARGA DE COMANDOS Y EVENTOS ---
const folders = ['commands', 'events'];
folders.forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) return;
    fs.readdirSync(p).forEach(file => {
        const item = require(path.join(p, file));
        if (dir === 'commands') client.commands.set(item.data?.name || item.name, item);
        else client.on(item.name, (...args) => item.execute(...args, client));
    });
});

// --- READY ---
client.once(Events.ClientReady, async (c) => {
    console.log(`✅ ${c.user.tag} está lista.`);
    const slash = client.commands.filter(cmd => cmd.data).map(cmd => cmd.data.toJSON());
    await client.application.commands.set(slash);
});

// --- MANEJADOR DE INTERACCIONES ---
client.on(Events.InteractionCreate, async (interaction) => {
    
    // 1. COMANDOS SLASH
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) await cmd.execute(interaction, client).catch(console.error);
    }

    // 2. BOTONES (Votos, Tickets, Roles)
    if (interaction.isButton()) {
        // Votos Sugerencias (Anti-Spam)
        if (interaction.customId === 'vote_up' || interaction.customId === 'vote_down') {
            const suggestData = await Suggestion.findOne({ MessageID: interaction.message.id });
            if (!suggestData) return interaction.reply({ content: '❌ Error de datos.', ephemeral: true });

            if (suggestData.UpVoters.includes(interaction.user.id) || suggestData.DownVoters.includes(interaction.user.id)) {
                return interaction.reply({ content: '❌ Ya has votado.', ephemeral: true });
            }

            if (interaction.customId === 'vote_up') suggestData.UpVoters.push(interaction.user.id);
            else suggestData.DownVoters.push(interaction.user.id);
            await suggestData.save();

            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.spliceFields(1, 1, { name: '✅ Votos positivos', value: suggestData.UpVoters.length.toString(), inline: true });
            embed.spliceFields(2, 1, { name: '❌ Votos negativos', value: suggestData.DownVoters.length.toString(), inline: true });
            return await interaction.update({ embeds: [embed] });
        }

        // Reaction Roles
        if (interaction.customId.startsWith('rr_')) {
            const roleId = interaction.customId.split('_')[1];
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return;
            if (interaction.member.roles.cache.has(roleId)) {
                await interaction.member.roles.remove(role);
                return interaction.reply({ content: `🌸 Rol removido: **${role.name}**`, ephemeral: true });
            } else {
                await interaction.member.roles.add(role);
                return interaction.reply({ content: `✅ Rol asignado: **${role.name}**`, ephemeral: true });
            }
        }
    }

    // 3. MODALES (Configuraciones y Webhooks)
    if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId.startsWith('modal_conf_')) {
            const type = interaction.customId.replace('modal_conf_', '');
            const key = type === 'welcome_1' ? 'Welcome1Config' : type === 'welcome_2' ? 'Welcome2Config' : 'ByeConfig';
            
            await GuildConfig.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { $set: { 
                    [`${key}.title`]: interaction.fields.getTextInputValue('m_title'), 
                    [`${key}.desc`]: interaction.fields.getTextInputValue('m_desc'), 
                    [`${key}.image`]: interaction.fields.getTextInputValue('m_img'), 
                    [`${key}.channelId`]: interaction.fields.getTextInputValue('m_canal') 
                }},
                { upsert: true }
            );
            return interaction.reply({ content: `✅ Configuración de **${type}** guardada.`, ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);