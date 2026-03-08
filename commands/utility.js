const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Nombre para el sistema de prefijo (!!)
    name: 'utility', 
    category: 'utilidades',
    
    // Nombre para el sistema de Slash (/) - AQUÍ ESTABA EL ERROR
    data: new SlashCommandBuilder()
        .setName('utility') // <--- ESTO ES LO QUE FALTABA
        .setDescription('Comandos de utilidad general'),

    async execute(input) {
        // Tu lógica del comando aquí
        const msg = "📊 El sistema de utilidades está funcionando correctamente.";
        
        if (input.user) { // Es un Slash Command
            return input.reply({ content: msg, ephemeral: true });
        } else { // Es un comando de prefijo
            return input.reply(msg);
        }
    }
};