const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createWelcomeFarewellEmbed } = require('../events/embedBuilder.js');

const configPath = path.join(__dirname, '..', 'welcomeConfig.json');

function saveConfig(guildId, data) {
    let config = {};
    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config[guildId] = data;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getConfig(guildId) {
    if (!fs.existsSync(configPath)) return null;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config[guildId];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Sistema de bienvenida')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('configurar')
                .setDescription('Configura las opciones de bienvenida')
                .addChannelOption(opt => opt.setName('canal').setDescription('Canal de bienvenidas').setRequired(false))
                .addRoleOption(opt => opt.setName('rol-usuario').setDescription('Rol para asignar a nuevos usuarios.'))
                .addRoleOption(opt => opt.setName('rol-bot').setDescription('Rol para asignar a nuevos bots.'))
                .addChannelOption(opt => opt.setName('logs').setDescription('Canal de logs').setRequired(false))
                .addStringOption(opt => opt.setName('titulo').setDescription('Título del embed. Usa "none" para borrarlo.')) // No change needed here, just for context
                .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción del embed. Usa "none" para borrarla.'))
                .addStringOption(opt => opt.setName('thumbnail').setDescription('URL del thumbnail. Usa "none" para borrarlo.'))
                .addStringOption(opt => opt.setName('imagen').setDescription('URL de la imagen. Usa "none" para borrarla.'))
                .addStringOption(opt => opt.setName('footer').setDescription('Texto del footer. Usa "none" para borrarlo.'))
                .addStringOption(opt => opt.setName('footerimg').setDescription('URL imagen footer. Usa "none" para borrarla.'))
                .addStringOption(opt => opt.setName('mensaje').setDescription('Texto fuera del embed. Usa "none" para borrarlo.'))
                .addStringOption(opt => opt.setName('color').setDescription('Color del embed (ej. #FF5733).'))
                .addBooleanOption(opt => opt.setName('timestamp').setDescription('¿Agregar timestamp?').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('preview')
                .setDescription('Muestra una vista previa del embed actual (solo tú lo ves)')
        )
        .addSubcommand(sub =>
            sub.setName('test')
                .setDescription('Envía una prueba al canal configurado')
        ),
    category: 'manager',
    description: 'Configura, previsualiza o prueba la bienvenida',
    usage: '!!welcome <opcion> <valor> | !!welcome <preview|test>',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply('No tienes permisos.');
        
        if (args.length === 0) {
            const helpEmbed = new EmbedBuilder()
                .setTitle('Ayuda del Comando Welcome')
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .addFields(
                    { name: 'Uso', value: '`!!welcome <opción> <valor>`' },
                    { name: 'Opciones', value: '`canal`, `rol-usuario`, `rol-bot`, `logs`, `titulo`, `descripcion`, `thumbnail`, `imagen`, `footer`, `footerimg`, `mensaje`, `color`, `timestamp`.' },
                    { name: 'Variables Disponibles', value: '`{user}` - Mención al usuario (Ej: @Usuario)\n`{username}` - Nombre de usuario (Ej: Usuario)\n`{nick}` - Apodo del usuario\n`{server}` - Nombre del servidor\n`{count}` - Número de miembros' },
                    { name: 'Ejemplos', value: '`!!welcome canal #bienvenidas`\n`!!welcome mensaje ¡Hola {user}!`\n`!!welcome color #FF5733`' },
                    { name: 'Borrar un campo', value: 'Para borrar un campo de texto, usa el valor `none`.\n`!!welcome titulo none`' },
                    { name: 'Probar', value: '`!!welcome preview` - Vista previa para ti.\n`!!welcome test` - Envía un mensaje de prueba al canal.' }
                );
            return message.reply({ embeds: [helpEmbed] });
        }

        const option = args[0].toLowerCase();
        const config = getConfig(message.guild.id) || {};

        // Lógica para Preview y Test
        if (option === 'preview' || option === 'test') {
            if (!config.channelId) return message.reply('No hay configuración de bienvenida. Usa `!!welcome canal #tu-canal` primero.');
            const { embed, content } = createWelcomeFarewellEmbed(message.member, config);
            if (option === 'preview') return message.reply({ content: content || undefined, embeds: [embed] });
            
            const channel = message.guild.channels.cache.get(config.channelId);
            if (!channel) return message.reply('El canal configurado no existe.');
            await channel.send({ content: content || undefined, embeds: [embed] });
            return message.reply(`Prueba enviada a ${channel}.`); // No change needed here, just for context
        }

        if (args.length < 2) return message.reply('Falta el valor. Uso: `!!welcome <opcion> <valor>`');
        const value = args.slice(1).join(' ');
        const newConfig = { ...config };

        const validOptions = ['canal', 'logs', 'titulo', 'descripcion', 'thumbnail', 'imagen', 'footer', 'footerimg', 'mensaje', 'color', 'timestamp', 'rol-usuario', 'rol-bot'];
        if (!validOptions.includes(option)) return message.reply('Opción no válida.');

        let finalValue = (value.toLowerCase() === 'none' || value.toLowerCase() === 'ninguno') ? null : value;

        if (option === 'canal' || option === 'logs') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(value);
            if (!channel) return message.reply('Canal inválido.');
            newConfig[option === 'canal' ? 'channelId' : 'logsId'] = channel.id;
        } else if (option === 'rol-usuario' || option === 'rol-bot') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(value);
            if (!role) return message.reply('Rol inválido.');
            newConfig[option === 'rol-usuario' ? 'userRoleId' : 'botRoleId'] = role.id;
        } else if (option === 'timestamp') {
            newConfig.timestamp = ['true', 'on', 'si', '1'].includes(value.toLowerCase());
        } else {
            newConfig[option] = finalValue;
        }

        saveConfig(message.guild.id, newConfig);
        message.reply(`Configuración de bienvenida actualizada: **${option}**`); // No change needed here, just for context
    },
    async executeSlash(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = getConfig(interaction.guild.id) || {};

        if (subcommand === 'preview' || subcommand === 'test') {
            if (!config.channelId) return interaction.reply({ content: 'No hay configuración de bienvenida. Usa `/welcome configurar` primero.', flags: MessageFlags.Ephemeral });
            const { embed, content } = createWelcomeFarewellEmbed(interaction.member, config);
            if (subcommand === 'preview') return interaction.reply({ content: content || undefined, embeds: [embed], flags: MessageFlags.Ephemeral });
            
            const channel = interaction.guild.channels.cache.get(config.channelId);
            if (!channel) return interaction.reply({ content: 'El canal configurado no existe.', flags: MessageFlags.Ephemeral });
            await channel.send({ content: content || undefined, embeds: [embed] });
            return interaction.reply({ content: `Prueba enviada a ${channel}.`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'configurar') {
            const newConfig = { ...config };
            const options = interaction.options;

            const fields = {
                channelId: options.getChannel('canal')?.id,
                userRoleId: options.getRole('rol-usuario')?.id,
                botRoleId: options.getRole('rol-bot')?.id,
                logsId: options.getChannel('logs')?.id,
                titulo: options.getString('titulo'),
                descripcion: options.getString('descripcion'),
                thumbnail: options.getString('thumbnail'),
                imagen: options.getString('imagen'),
                footer: options.getString('footer'),
                footerimg: options.getString('footerimg'),
                mensaje: options.getString('mensaje'),
                color: options.getString('color'),
                timestamp: options.getBoolean('timestamp')
            };

            for (const [key, value] of Object.entries(fields)) {
                if (value !== null && value !== undefined) {
                    const isNone = typeof value === 'string' && (value.toLowerCase() === 'none' || value.toLowerCase() === 'ninguno');
                    newConfig[key] = isNone ? null : value;
                }
            }
            
            if (!newConfig.channelId && !config.channelId) { // No change needed here, just for context
                return interaction.reply({ content: 'Debes configurar al menos el canal de bienvenida la primera vez.', flags: MessageFlags.Ephemeral }); // No change needed here, just for context
            }

            saveConfig(interaction.guild.id, newConfig);
            await interaction.reply({ content: '¡Configuración de bienvenida actualizada!', flags: MessageFlags.Ephemeral }); // No change needed here, just for context
        }
    },
    getConfig
};