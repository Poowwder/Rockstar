const { SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'deploy',
    description: '🚀 Registra los Slash Commands en Discord y recarga el código.',
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('🚀 Sincroniza comandos y recarga el sistema')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(input) {
        const isSlash = !!input.user;
        const member = input.member;
        const client = input.client;

        // Validar permisos (Solo Administradores)
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorMsg = '❌ No tienes permisos suficientes para ejecutar un deploy en el servidor.';
            return isSlash ? input.reply({ content: errorMsg, ephemeral: true }) : input.reply(errorMsg);
        }

        let loadingMsg;
        if (isSlash) {
            loadingMsg = await input.reply({ content: '⏳ **Iniciando sincronización de comandos y recarga de código...**', fetchReply: true });
        } else {
            loadingMsg = await input.reply('⏳ **Iniciando sincronización de comandos y recarga de código...**');
        }

        // --- 🔄 HOT RELOAD: RECARGA EL CÓDIGO ANTES DEL DEPLOY ---
        const commandsPath = path.join(__dirname, '../commands');
        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        client.commands.clear(); // Limpiamos la memoria del bot

        for (const file of files) {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)]; // Borramos el caché de Node
            try {
                const command = require(filePath);
                const cmdName = command.name || (command.data && command.data.name);
                if (cmdName) {
                    client.commands.set(cmdName, command); // Guardamos la versión nueva en memoria
                }
            } catch (error) {
                console.error(`❌ Error recargando ${file}:`, error);
            }
        }
        // --- FIN DEL HOT RELOAD ---

        // --- DEPLOY A LA API DE DISCORD ---
        const commands = [];
        const commandFiles = client.commands.filter(cmd => cmd.data);

        for (const [name, command] of commandFiles) {
            commands.push(command.data.toJSON());
        }

        // Usamos el ID del archivo .env O el ID del bot actual para evitar el error "undefined"
        const clientId = process.env.CLIENT_ID || client.user.id;
        const token = process.env.TOKEN;

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            // Registramos de forma global
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            const embed = new EmbedBuilder()
                .setTitle('🚀 DEPLOY EXITOSO')
                .setColor('#1a1a1a')
                .setDescription(`Se han recargado y sincronizado **${commands.length}** comandos correctamente.\n\n> *Ya puedes usar los comandos de barra (/) y el código nuevo está activo en memoria.*`)
                .setTimestamp();

            // Editamos el mensaje original dependiendo de cómo se ejecutó
            if (isSlash) {
                await input.editReply({ content: '✅ **Proceso finalizado.**', embeds: [embed] });
            } else {
                await loadingMsg.edit({ content: '✅ **Proceso finalizado.**', embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ ERROR EN EL DEPLOY')
                .setColor('#ff0000')
                .setDescription(`\`\`\`js\n${error.message}\n\`\`\``);
            
            if (isSlash) {
                await input.editReply({ content: ' ', embeds: [errorEmbed] });
            } else {
                await loadingMsg.edit({ content: ' ', embeds: [errorEmbed] });
            }
        }
    },
};
