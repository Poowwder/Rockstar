const { REST, Routes, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'deploy',
    description: '🚀 Registra los Slash Commands en Discord.',
    async execute(message) {
        // Solo el dueño o admins deberían usar esto
        if (!message.member.permissions.has('Administrator')) return;

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
            await message.reply('⏳ **Iniciando sincronización de comandos...**');

            // Registramos de forma global
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            const embed = new EmbedBuilder()
                .setTitle('🚀 DEPLOY EXITOSO')
                .setColor('#1a1a1a')
                .setDescription(`Se han sincronizado **${commands.length}** comandos correctamente.\n\n> *Ya puedes usar los comandos de barra (/).*`)
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
