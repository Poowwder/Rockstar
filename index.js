const { Client, GatewayIntentBits, Collection, InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const { GuildConfig } = require('./data/mongodb.js'); // Para los comandos nuevos
const userManager = require('./data/userManager.js'); // Restaurado para tus comandos antiguos
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

// --- CARGA DE COMANDOS (Asegúrate de que esta ruta sea la correcta) ---
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Si el archivo exporta un array (como tu info.js), los cargamos uno a uno
    if (Array.isArray(command)) {
        command.forEach(cmd => client.commands.set(cmd.name, cmd));
    } else {
        client.commands.set(command.name, command);
    }
}

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} está lista.`);
});

client.on('interactionCreate', async interaction => {
    // --- MANEJO DE COMANDOS SLASH ---
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            // LÓGICA HÍBRIDA:
            // 1. Si el comando tiene executeSlash (tus comandos antiguos con userManager)
            if (typeof cmd.executeSlash === 'function') {
                await cmd.executeSlash(interaction);
            } 
            // 2. Si el comando tiene execute (comandos nuevos de MongoDB)
            else if (typeof cmd.execute === 'function') {
                await cmd.execute(interaction);
            }
        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
            }
        }
    }

    // --- MANEJO DE BOTONES (Reaction Roles, Welcome, etc) ---
    if (interaction.isButton()) {
        // Lógica para Reaction Roles (rr_rolid)
        if (interaction.customId.startsWith('rr_')) {
            const roleId = interaction.customId.split('_')[1];
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: '❌ Rol no encontrado.', ephemeral: true });

            if (interaction.member.roles.cache.has(roleId)) {
                await interaction.member.roles.remove(roleId);
                return interaction.reply({ content: `✅ Rol removido: **${role.name}**`, ephemeral: true });
            } else {
                await interaction.member.roles.add(roleId);
                return interaction.reply({ content: `✅ Rol asignado: **${role.name}**`, ephemeral: true });
            }
        }
        // Aquí puedes añadir más lógica de botones si la necesitas
    }
});

client.login(process.env.TOKEN);