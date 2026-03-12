const { SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 👑 TU ID DE DISCORD (Solo tú podrás usar el comando)
const CREATOR_ID = '1428164600091902055'; 

module.exports = {
    name: 'deploy',
    description: 'Comando clasificado. Acceso denegado a usuarios estándar.',
    category: 'oculto', // 🛡️ Esto lo hace invisible en el comando !!help
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Comando clasificado. Acceso denegado a usuarios estándar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const client = input.client;

        // --- 🔒 SEGURIDAD DE NIVEL DIOS ---
        if (author.id !== CREATOR_ID) {
            const errorMsg = '╰┈➤ ❌ **Acceso denegado.** Comando encriptado. Solo la creadora del sistema posee las credenciales necesarias.';
            return isSlash ? input.reply({ content: errorMsg, ephemeral: true }) : input.reply(errorMsg);
        }

        let loadingMsg;
        if (isSlash) {
            loadingMsg = await input.reply({ content: '╰┈➤ ⏳ **Iniciando protocolo de sincronización y recarga del núcleo...**', fetchReply: true });
        } else {
            loadingMsg = await input.reply('╰┈➤ ⏳ **Iniciando protocolo de sincronización y recarga del núcleo...**');
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

        // --- 🚀 DEPLOY A LA API DE DISCORD ---
        const commands = [];
        const commandFiles = client.commands.filter(cmd => cmd.data);

        for (const [name, command] of commandFiles) {
            commands.push(command.data.toJSON());
        }

        // Usamos el ID del archivo .env O el ID del bot actual
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
                .setTitle('⊹ NÚCLEO SINCRONIZADO ⊹')
                .setColor('#1a1a1a') // Negro Rockstar
                .setDescription(`Se han recargado y enlazado **${commands.length}** archivos de sistema.\n\n> *La matriz está actualizada. Los comandos de barra (/) y el nuevo código ya operan en las sombras.*`)
                .setTimestamp()
                .setFooter({ text: 'Protocolo Deploy ⊹ Rockstar Nova', iconURL: author.displayAvatarURL() });

            if (isSlash) {
                await input.editReply({ content: '╰┈➤ ✅ **Sincronización completa.**', embeds: [embed] });
            } else {
                await loadingMsg.edit({ content: '╰┈➤ ✅ **Sincronización completa.**', embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ FALLO CRÍTICO EN EL DEPLOY')
                .setColor('#ff4d4d')
                .setDescription(`\`\`\`js\n${error.message}\n\`\`\``);
            
            if (isSlash) {
                await input.editReply({ content: ' ', embeds: [errorEmbed] });
            } else {
                await loadingMsg.edit({ content: ' ', embeds: [errorEmbed] });
            }
        }
    },
};
