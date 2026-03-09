const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configura canales, roles y el mensaje de bienvenida del sistema Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const { guild, client, user } = interaction;
        const OWNER_ID = '1134261491745493032'; // 👑 Tu ID
        const configPath = path.join(__dirname, '../data/config.json');

        await interaction.deferReply();

        try {
            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}');
            }

            // 1. Crear/Buscar Rol Muted
            let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
            if (!muteRole) {
                muteRole = await guild.roles.create({
                    name: 'Muted',
                    color: '#2f3136',
                    reason: 'Setup Rockstar ✨'
                });
            }

            // 2. Crear Categoría y Canales
            const category = await guild.channels.create({ name: '🌸 Rockstar System', type: ChannelType.GuildCategory });
            const logChannel = await guild.channels.create({ name: '📋-auditoria-sakura', type: ChannelType.GuildText, parent: category.id });
            const ecoChannel = await guild.channels.create({ name: '🌸-jardin-sakura', type: ChannelType.GuildText, parent: category.id });

            // 3. Guardar IDs
            config.logChannelId = logChannel.id;
            config.economyChannelId = ecoChannel.id;
            config.muteRoleId = muteRole.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            // 4. Configurar Botones (FILTRO DE VISIBILIDAD)
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('view_info').setLabel('Más Info').setStyle(ButtonStyle.Secondary).setEmoji('🎀'),
                new ButtonBuilder().setLabel('Soporte').setStyle(ButtonStyle.Link).setURL('https://discord.gg/link')
            );

            // 🛑 SOLO LA CREADORA VE LA TUERCA
            if (user.id === OWNER_ID) {
                row.addComponents(
                    new ButtonBuilder().setCustomId('admin_settings').setLabel('⚙️').setStyle(ButtonStyle.Secondary)
                );
            }

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('🌸 ¡Bienvenidos al Jardín Sakura! ✨')
                .setColor(config.mainColor || '#FFB6C1')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(`¡Hola! Este es el canal oficial para interactuar con el sistema de **Rockstar**. 🎀\n\nAquí puedes usar los comandos de economía y social.\n\n*Usa el prefijo \`!!\` para los comandos de texto o revisa los comandos de barra (/).*`)
                .setImage("https://i.pinimg.com/originals/94/34/06/943406f52e463510e1378393521d965e.gif")
                .setFooter({ text: 'Rockstar System Assistant', iconURL: client.user.displayAvatarURL() });

            await ecoChannel.send({ embeds: [welcomeEmbed], components: [row] });

            return interaction.editReply({ content: `✅ **Setup completado.** Los canales han sido creados en la categoría **Rockstar System**. ✨` });

        } catch (error) {
            console.error(error);
            return interaction.editReply("❌ Hubo un error al configurar el sistema.");
        }
    }
};