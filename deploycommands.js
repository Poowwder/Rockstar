const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('--- 🚀 Forzando Sincronización de Comandos ---');

for (const file of commandFiles) {
    const filePath = path.join(__dirname, 'commands', file);
    const command = require(filePath);

    if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`📦 Comando preparado: /${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🧹 Limpiando comandos antiguos...');
        // Esto borra los comandos viejos antes de poner los nuevos
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        console.log(`⏳ Registrando ${commands.length} comandos nuevos...`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✨ ¡TODO LISTO! Discord ha sido actualizado.');
    } catch (error) {
        console.error('❌ Error en el Deploy:', error);
    }
})();