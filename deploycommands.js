const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('\n─── 🖤 ⟢ ₊˚ Rockstar Deploy System ˚₊ ⟣ 🖤 ───');
console.log(`📂 Ejecutando: deploycommands.js`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Solo registramos los que tienen la propiedad .data (Slash Commands)
    if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`✨ [Híbrido] /${command.data.name} preparado para sincronizar.`);
    } else {
        // Log informativo para los que solo funcionan con !!
        console.log(`🌙 [Prefijo] ${file} detectado.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('\n🧹 Limpiando rastro de comandos antiguos en Discord...');
        
        // Limpiamos los comandos globales para evitar duplicados o "fantasmas"
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );

        console.log(`⏳ Inyectando ${commands.length} comandos nuevos en la API...`);

        // Registramos la nueva lista global
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('\n✨ ⟢ ₊˚ DESPLIEGE EXITOSO ˚₊ ⟣ ✨');
        console.log(`╰┈➤ Se han sincronizado ${data.length} comandos globales con éxito.\n`);
        
    } catch (error) {
        console.error('❌ Error crítico en el despliegue:', error);
    }
})();
