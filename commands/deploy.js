const { REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'deploy',
    description: '🚀 Registra los Slash Commands en Discord.',
    async execute(message) {
        // Solo el dueño o admins deberían usar esto
        if (!message.member.permissions.has('Administrator')) return;

        // --- 🔄 HOT RELOAD: RECARGA EL CÓDIGO ANTES DEL DEPLOY ---
        const commandsPath = path.join(__dirname, '../commands');
        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        message.client.commands.clear(); // Limpiamos la memoria del bot

        for (const file of files) {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)]; // Borramos el caché
            try {
                const command = require(filePath);
                const cmdName = command.name || (command.data && command.data.name);
                if (cmdName) {
                    message.client.commands.set(cmdName, command); // Guardamos la versión nueva
                }
            } catch (error) {
                console.error(`❌ Error recargando ${file}:`, error);
            }
        }
        // --- FIN DEL HOT RELOAD ---

        // --- TU CÓDIGO ORIGINAL COMIENZA AQUÍ ---
        const commands = [];
        const commandFiles = message.client.commands.filter(cmd => cmd.data);

        for (const [name, command] of commandFiles) {
            commands.push(command.data.toJSON());
        }

        // Usamos el ID del archivo .env O el ID del bot actual para evitar el error "undefined"
        const clientId = process.env.CLIENT_ID || message.client.user.id;
        const token = process.env.TOKEN;

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            await message.reply('⏳ **Iniciando sincronización de comandos y recarga de código...**');

            // Registramos de forma global
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            const embed = new EmbedBuilder()
                .setTitle('🚀 DEPLOY EXITOSO')
                .setColor('#1a1a1a')
                .setDescription(`Se han recargado y sincronizado **${commands.length}** comandos correctamente.\n\n> *Ya puedes usar los comandos de barra (/) y el código nuevo está activo.*`)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ ERROR EN EL DEPLOY')
                .setColor('#ff0000')
                .setDescription(`\`\`\`js\n${error.message}\n\`\`\``);
            
            await message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
