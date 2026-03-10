const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log('--- 📡 Preparando Comandos para Discord ---');

for (const file of commandFiles) {
    const filePath = path.join(__dirname, 'commands', file);
    const command = require(filePath);

    if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`✅ Preparado: /${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`⏳ Sincronizando ${commands.length} comandos con la API de Discord...`);

        // Usamos Routes.applicationCommands para que sea GLOBAL
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✨ ¡Éxito! El menú de comandos "/" ha sido actualizado en todos los servidores.');
    } catch (error) {
        console.error('❌ Error crítico al registrar comandos:', error);
    }
})();