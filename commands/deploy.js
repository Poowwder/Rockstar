const { REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

module.exports = {
    name: 'deploy',
    description: 'Sincroniza los Slash Commands desde Discord (Solo Owner).',
    category: 'oculto',
    async execute(message) {
        // --- 🛡️ SEGURIDAD ABSOLUTA ---
        // Pon tu ID real aquí para que NADIE más pueda usar este comando
        const OWNER_ID = '1428164600091902055'; 
        if (message.author.id !== OWNER_ID) return; 

        const msg = await message.reply("⏳ *Iniciando sincronización en las sombras...*");

        try {
            const commands = [];
            // Leemos la carpeta actual (commands)
            const commandsPath = __dirname; 
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                // Borramos el caché para que lea los cambios más recientes que hiciste en GitHub
                delete require.cache[require.resolve(`./${file}`)];
                const command = require(`./${file}`);

                if (command.data) {
                    commands.push(command.data.toJSON());
                }
            }

            // --- 🌐 CONEXIÓN A LA API DE DISCORD ---
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

            // Primero limpiamos
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            );

            // Luego inyectamos los nuevos
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );

            // --- ✨ RESPUESTA ESTÉTICA ---
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setTitle('✨ ⟢ ₊˚ Sincronización Exitosa ˚₊ ⟣ ✨')
                // 🔥 AQUÍ ESTÁ LA LÍNEA ARREGLADA (Escapamos ambos backticks con \ )
                .setDescription(`Se han inyectado \`${commands.length}\` comandos híbridos en la API.\n\n╰┈➤ Los Slash Commands ( \`/\` ) ya están actualizados en el servidor.`)
                .setFooter({ text: 'Rockstar Deploy System' });

            await msg.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error('❌ Error en el comando deploy:', error);
            await msg.edit(`❌ **Fallo en el sistema:** \`${error.message}\``);
        }
    }
};
