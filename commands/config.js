const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- File I/O Helpers ---
const blockedUsersPath = path.join(__dirname, '..', 'blockedUsers.json');
const serverConfigsPath = path.join(__dirname, '..', 'serverConfigs.json');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function sendLog(guild, embed) {
    const configs = readJSON(serverConfigsPath);
    const logChannelId = configs[guild.id]?.logChannel;
    if (!logChannelId) return;
    const channel = guild.channels.cache.get(logChannelId);
    if (channel) await channel.send({ embeds: [embed] }).catch(() => {});
}

// --- Command Definitions ---
const commands = [
    // BLOCK ADD
    {
        name: 'block-add',
        description: 'Bloquea a un usuario para que no pueda usar el bot.',
        usage: '!!block-add <@usuario>',
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario a bloquear.').setRequired(true)),
        async execute(ctx, targetUser) {
            const user = ctx.user || ctx.author;
            const member = ctx.member || ctx.guild.members.cache.get(user.id);
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return ctx.reply({ content: '❌ Solo los administradores pueden usar este comando.', flags: MessageFlags.Ephemeral });
            }
            if (!targetUser) {
                return ctx.reply({ content: '❌ Debes mencionar a un usuario para bloquear.', flags: MessageFlags.Ephemeral });
            }
            if (targetUser.id === ctx.client.user.id) {
                return ctx.reply({ content: '❌ No puedes bloquearme a mí mismo.', flags: MessageFlags.Ephemeral });
            }

            const blockedUsers = readJSON(blockedUsersPath);
            if (!blockedUsers[ctx.guild.id]) {
                blockedUsers[ctx.guild.id] = [];
            }

            if (blockedUsers[ctx.guild.id].includes(targetUser.id)) {
                return ctx.reply({ content: `**${targetUser.username}** ya está en la lista de bloqueados.`, flags: MessageFlags.Ephemeral });
            }

            blockedUsers[ctx.guild.id].push(targetUser.id);
            writeJSON(blockedUsersPath, blockedUsers);

            await ctx.reply({ content: `✅ **${targetUser.username}** ha sido bloqueado y no podrá usar el bot en este servidor.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🚫 Usuario Bloqueado')
                .setDescription(`**Usuario:** ${targetUser.tag}\n**Moderador:** ${ctx.user ? ctx.user.tag : ctx.author.tag}`)
                .setColor('#FF6961')
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // BLOCK REMOVE
    {
        name: 'block-remove',
        description: 'Desbloquea a un usuario.',
        usage: '!!block-remove <@usuario>',
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario a desbloquear.').setRequired(true)),
        async execute(ctx, targetUser) {
            const user = ctx.user || ctx.author;
            const member = ctx.member || ctx.guild.members.cache.get(user.id);
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return ctx.reply({ content: '❌ Solo los administradores pueden usar este comando.', flags: MessageFlags.Ephemeral });
            }
            if (!targetUser) {
                return ctx.reply({ content: '❌ Debes mencionar a un usuario para desbloquear.', flags: MessageFlags.Ephemeral });
            }

            const blockedUsers = readJSON(blockedUsersPath);
            if (!blockedUsers[ctx.guild.id] || !blockedUsers[ctx.guild.id].includes(targetUser.id)) {
                return ctx.reply({ content: `**${targetUser.username}** no está en la lista de bloqueados.`, flags: MessageFlags.Ephemeral });
            }

            blockedUsers[ctx.guild.id] = blockedUsers[ctx.guild.id].filter(id => id !== targetUser.id);
            writeJSON(blockedUsersPath, blockedUsers);

            await ctx.reply({ content: `✅ **${targetUser.username}** ha sido desbloqueado.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('✅ Usuario Desbloqueado')
                .setDescription(`**Usuario:** ${targetUser.tag}\n**Moderador:** ${ctx.user ? ctx.user.tag : ctx.author.tag}`)
                .setColor('#77DD77')
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // BLOCK LIST
    {
        name: 'block-list',
        description: 'Muestra la lista de usuarios bloqueados.',
        usage: '!!block-list',
        async execute(ctx) {
            const user = ctx.user || ctx.author;
            const member = ctx.member || ctx.guild.members.cache.get(user.id);
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return ctx.reply({ content: '❌ Solo los administradores pueden usar este comando.', flags: MessageFlags.Ephemeral });
            }

            const blockedUsers = readJSON(blockedUsersPath);
            const guildBlocked = blockedUsers[ctx.guild.id] || [];

            if (guildBlocked.length === 0) {
                return ctx.reply({ content: 'No hay usuarios bloqueados en este servidor.' });
            }

            const userMentions = guildBlocked.map(id => `<@${id}> (${id})`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`🚫 Usuarios Bloqueados en ${ctx.guild.name}`)
                .setDescription(userMentions)
                .setColor('#FF6961');

            await ctx.reply({ embeds: [embed] });
        }
    },
    // LANGUAGE SET
    {
        name: 'language-set',
        description: 'Establece el idioma del bot para el servidor.',
        usage: '!!language-set <idioma>',
        builder: (builder) => builder.addStringOption(opt => opt.setName('idioma').setDescription("El idioma a establecer ('es' o 'en').").setRequired(true).addChoices({ name: 'Español', value: 'es' }, { name: 'English', value: 'en' })),
        async execute(ctx, lang) {
            const user = ctx.user || ctx.author;
            const member = ctx.member || ctx.guild.members.cache.get(user.id);
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return ctx.reply({ content: '❌ Solo los administradores pueden usar este comando.', flags: MessageFlags.Ephemeral });
            }

            const validLangs = ['es', 'en'];
            if (!validLangs.includes(lang)) {
                return ctx.reply({ content: `Idioma no válido. Opciones disponibles: ${validLangs.join(', ')}`, flags: MessageFlags.Ephemeral });
            }

            const serverConfigs = readJSON(serverConfigsPath);
            if (!serverConfigs[ctx.guild.id]) {
                serverConfigs[ctx.guild.id] = {};
            }
            serverConfigs[ctx.guild.id].language = lang;
            writeJSON(serverConfigsPath, serverConfigs);

            await ctx.reply({ content: `✅ El idioma del bot se ha establecido a **${lang}**.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🌐 Idioma Cambiado')
                .setDescription(`**Nuevo Idioma:** ${lang}\n**Moderador:** ${ctx.user ? ctx.user.tag : ctx.author.tag}`)
                .setColor('#AEC6CF')
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // LANGUAGE VIEW
    {
        name: 'language-view',
        description: 'Muestra el idioma actual del bot para el servidor.',
        usage: '!!language-view',
        async execute(ctx) {
            const serverConfigs = readJSON(serverConfigsPath);
            const lang = serverConfigs[ctx.guild.id]?.language || 'es'; // Default to 'es'

            await ctx.reply({ content: `El idioma actual del bot en este servidor es: **${lang}**.` });
        }
    },
    // LOG SET
    {
        name: 'log-set',
        description: 'Establece el canal de logs para el servidor.',
        usage: '!!log-set <#canal>',
        builder: (builder) => builder.addChannelOption(opt => opt.setName('canal').setDescription('El canal para los logs.').setRequired(true)),
        async execute(ctx, channel) {
            const user = ctx.user || ctx.author;
            const member = ctx.member || ctx.guild.members.cache.get(user.id);
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return ctx.reply({ content: '❌ Solo los administradores pueden usar este comando.', flags: MessageFlags.Ephemeral });
            }

            if (!channel || !channel.isTextBased()) {
                return ctx.reply({ content: '❌ Canal inválido.', flags: MessageFlags.Ephemeral });
            }

            const serverConfigs = readJSON(serverConfigsPath);
            if (!serverConfigs[ctx.guild.id]) serverConfigs[ctx.guild.id] = {};
            serverConfigs[ctx.guild.id].logChannel = channel.id;
            writeJSON(serverConfigsPath, serverConfigs);

            await ctx.reply({ content: `✅ Canal de logs establecido a ${channel}.` });
        }
    }
];

// --- Dynamic Command Builder ---
module.exports = commands.map(cmdConfig => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdConfig.name)
            .setDescription(cmdConfig.description),
        category: 'manager',
        description: cmdConfig.description,
        usage: cmdConfig.usage,
        aliases: cmdConfig.aliases || [],
        
        async execute(message, args) {
            if (['block-add', 'block-remove'].includes(cmdConfig.name)) {
                const target = message.mentions.users.first();
                return cmdConfig.execute(message, target);
            }
            if (cmdConfig.name === 'language-set') {
                const lang = args[0];
                if (!lang) return message.reply({ content: '❌ Debes especificar un idioma.' });
                return cmdConfig.execute(message, lang.toLowerCase());
            }
            if (cmdConfig.name === 'log-set') {
                const channel = message.mentions.channels.first();
                if (!channel) return message.reply({ content: '❌ Debes mencionar un canal.' });
                return cmdConfig.execute(message, channel);
            }
            return cmdConfig.execute(message);
        },

        async executeSlash(interaction) {
            if (['block-add', 'block-remove'].includes(cmdConfig.name)) {
                const target = interaction.options.getUser('usuario');
                return cmdConfig.execute(interaction, target);
            }
            if (cmdConfig.name === 'language-set') {
                const lang = interaction.options.getString('idioma');
                return cmdConfig.execute(interaction, lang);
            }
            if (cmdConfig.name === 'log-set') {
                const channel = interaction.options.getChannel('canal');
                return cmdConfig.execute(interaction, channel);
            }
            return cmdConfig.execute(interaction);
        }
    };
    if (cmdConfig.builder) {
        cmdConfig.builder(command.data);
    }
    return command;
});