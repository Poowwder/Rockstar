const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configura automáticamente los canales del sistema Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        const configPath = path.join(__dirname, '../data/config.json');

        // Asegurar que la carpeta data existe
        if (!fs.existsSync(path.dirname(configPath))) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }

        await interaction.deferReply();

        try {
            // 1. Crear la Categoría Principal
            const category = await guild.channels.create({
                name: '🌸 Rockstar System',
                type: ChannelType.GuildCategory,
            });

            // 2. Crear Canal de Logs (Privado para Admins)
            const logChannel = await guild.channels.create({
                name: '📋-auditoria-sakura',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });

            // 3. Crear Canal de Economía/Chat
            const ecoChannel = await guild.channels.create({
                name: '🌸-jardin-sakura',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Canal oficial para usar comandos de economía y social !!'
            });

            // 4. Guardar en Configuración
            const config = {
                logChannelId: logChannel.id,
                economyChannelId: ecoChannel.id,
                categoryId: category.id
            };

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const embedSuccess = new EmbedBuilder()
                .setAuthor({ 
                    name: `Configuración de ${interaction.guild.name}`, 
                    iconURL: guild.iconURL({ dynamic: true }) 
                })
                .setTitle('✨ ¡Sistema Instalado con Éxito!')
                .setColor('#FFB6C1')
                .setThumbnail("https://i.pinimg.com/originals/de/21/e4/de21e4286663f9a76479f6e1e7f62e6e.gif")
                .setDescription(`Se ha creado la categoría y los canales necesarios.\n\n**Canales creados:**\n> 📋 <#${logChannel.id}>\n> 🌸 <#${ecoChannel.id}>\n\n*Los logs ya están vinculados y listos para registrar actividad.*`)
                .setFooter({ text: 'Rockstar Setup Assistant 🎀', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.editReply({ embeds: [embedSuccess] });

        } catch (error) {
            console.error(error);
            return interaction.editReply("❌ Hubo un error al crear los canales. Revisa que tenga permisos de 'Gestionar Canales'.");
        }
    }
};