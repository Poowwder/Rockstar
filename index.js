// ... (Mantén toda tu parte inicial de carga de comandos igual) ...

// --- MANEJADOR DE INTERACCIONES (SLASH COMMANDS) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        // 🌸 TRUCO: Si el comando espera 'message' (Prefix antiguo)
        // le pasamos la interacción como si fuera el primer parámetro.
        // Los comandos nuevos (Híbridos) ya saben leer 'interaction'.
        await cmd.execute(interaction, interaction.options); 
    } catch (error) {
        console.error(`❌ Error en Slash ${interaction.commandName}:`, error);
        if (!interaction.replied) {
            await interaction.reply({ content: '╰┈➤ 🌸 ¡Ups! Hubo un error interno, linda.', ephemeral: true });
        }
    }
});

// --- MANEJADOR DE MENSAJES (PREFIX COMMANDS) ---
client.on('messageCreate', async (message) => {
    const prefix = "!!";
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    
    const cmd = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    
    if (cmd) {
        try {
            // 🌸 Pasamos 'message' y 'args' para los comandos tipo Prefix (como tu rank.js)
            // Los comandos Híbridos (como mine.js) también aceptarán 'message' como primer parámetro.
            await cmd.execute(message, args);
        } catch (error) {
            console.error(`❌ Error en Prefix ${cmdName}:`, error);
            message.reply("╰┈➤ 🌸 Ocurrió un error al procesar este comando.");
        }
    }
});

// ... (Mantén tu ready y login igual) ...