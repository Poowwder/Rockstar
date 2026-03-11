const { REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getE = (guild) => {
    const emojis = guild?.emojis.cache.filter(e => e.available);
    return (emojis && emojis.size > 0) ? emojis.random().toString() : '⚡';
};

module.exports = {
    name: 'deploy',
    description: 'Sincroniza los Slash Commands (Solo Owner).',
    category: 'oculto',
    async execute(message) {
        // --- 🛡️ SEGURIDAD NIVEL ROCKSTAR ---
        const OWNER_ID = '1428164600091902055'; 
        if (message.author.id !== OWNER_ID) return; 

        const e = () => getE(message.guild);
        const msg = await message.reply(`> ${e()} *Iniciando protocolo de inyección en las sombras...*`);

        try {
            const commands = [];
            const commandsPath = __dirname; 
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                // Forzamos la lectura de los nuevos archivos de GitHub borrando el caché
                const filePath = require.resolve(`./${file}`);
                delete require.cache[filePath];
                
                const command = require(`./${file}`);

                if (command.data) {
                    commands.push(command.data.toJSON());
                }
            }

            // --- 🌐 CONEXIÓN E INYECCIÓN A DISCORD ---
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

            // Limpiamos los comandos antiguos para evitar duplicados o errores
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            );

            // Inyectamos la nueva lista de comandos actualizados
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );

            // --- 📄 RESULTADO ESTÉTICO ---
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setTitle(`${e()} ⟢ PROTOCOLO DEPLOY FINALIZADO ${e()}`)
                .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
                .setDescription(
                    `> *“El sistema ha sido reescrito bajo las nuevas órdenes.”*\n\n` +
                    `**─── ✦ STATUS ✦ ───**\n` +
                    `╰┈➤ **Comandos Inyectados:** \`${commands.length}\` \n` +
                    `╰┈➤ **Estado:** \`Sincronización Global Exitosa\`\n` +
                    `**─────────────────**\n\n` +
                    `╰┈➤ Los Slash Commands ( \`/\` ) ya están listos en todos los servidores.`
                )
                .setFooter({ text: 'Rockstar Operations System • Acceso Owner' });

            await msg.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error('❌ Error en el despliegue:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ ERROR EN EL DEPLOY')
                .setDescription(`\`\`\`js\n${error.message}\n\`\`\``);
            
            await msg.edit({ content: null, embeds: [errorEmbed] });
        }
    }
};
