const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

// --- File I/O Helpers ---
const warningsPath = path.join(__dirname, '..', 'warnings.json');
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
    // BAN
    {
        name: 'ban',
        description: 'Banea a un usuario del servidor.',
        usage: '!!ban <@usuario> [razón]',
        permissions: PermissionFlagsBits.BanMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a banear.').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón del baneo.')),
        async execute(ctx, targetUser, reason = 'Sin razón especificada') {
            const member = ctx.guild.members.cache.get(targetUser.id);
            
            if (member) {
                if (!member.bannable) return ctx.reply({ content: '❌ No puedo banear a este usuario (jerarquía de roles).', flags: MessageFlags.Ephemeral });
                if (ctx.member.roles.highest.position <= member.roles.highest.position) return ctx.reply({ content: '❌ No puedes banear a alguien con un rol igual o superior al tuyo.', flags: MessageFlags.Ephemeral });
            }

            await ctx.guild.members.ban(targetUser, { reason });
            await ctx.reply({ content: `✅ **${targetUser.tag}** ha sido baneado. Razón: ${reason}` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🔨 Usuario Baneado')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Usuario', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                    { name: 'Razón', value: reason }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // UNBAN
    {
        name: 'unban',
        description: 'Desbanea a un usuario del servidor.',
        usage: '!!unban <id_usuario> [razón]',
        permissions: PermissionFlagsBits.BanMembers,
        builder: (builder) => builder
            .addStringOption(opt => opt.setName('usuario_id').setDescription('El ID del usuario a desbanear.').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón del desbaneo.')),
        async execute(ctx, targetId, reason = 'Sin razón especificada') {
            try {
                await ctx.guild.members.unban(targetId, reason);
                await ctx.reply({ content: `✅ Usuario con ID **${targetId}** ha sido desbaneado.` });

                const logEmbed = new EmbedBuilder()
                    .setTitle('🔓 Usuario Desbaneado')
                    .setColor('#00FF00')
                    .addFields(
                        { name: 'ID Usuario', value: targetId, inline: true },
                        { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                        { name: 'Razón', value: reason }
                    )
                    .setTimestamp();
                await sendLog(ctx.guild, logEmbed);
            } catch (error) {
                return ctx.reply({ content: '❌ No se pudo desbanear al usuario. Verifica el ID o si está baneado.', flags: MessageFlags.Ephemeral });
            }
        }
    },
    // KICK
    {
        name: 'kick',
        description: 'Expulsa a un usuario del servidor.',
        usage: '!!kick <@usuario> [razón]',
        permissions: PermissionFlagsBits.KickMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a expulsar.').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón de la expulsión.')),
        async execute(ctx, targetUser, reason = 'Sin razón especificada') {
            const member = ctx.guild.members.cache.get(targetUser.id);
            if (!member) return ctx.reply({ content: '❌ Ese usuario no está en el servidor.', flags: MessageFlags.Ephemeral });
            if (!member.kickable) return ctx.reply({ content: '❌ No puedo expulsar a este usuario.', flags: MessageFlags.Ephemeral });
            if (ctx.member.roles.highest.position <= member.roles.highest.position) return ctx.reply({ content: '❌ No puedes expulsar a alguien con un rol igual o superior al tuyo.', flags: MessageFlags.Ephemeral });

            await member.kick(reason);
            await ctx.reply({ content: `✅ **${targetUser.tag}** ha sido expulsado. Razón: ${reason}` });

            const logEmbed = new EmbedBuilder()
                .setTitle('👢 Usuario Expulsado')
                .setColor('#FFA500')
                .addFields(
                    { name: 'Usuario', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                    { name: 'Razón', value: reason }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // TIMEOUT / MUTE
    {
        name: 'timeout',
        aliases: ['mute'],
        description: 'Aísla temporalmente a un usuario.',
        usage: '!!timeout <@usuario> <tiempo> [razón]',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a aislar.').setRequired(true))
            .addStringOption(opt => opt.setName('tiempo').setDescription('Duración (ej. 10m, 1h).').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón del aislamiento.')),
        async execute(ctx, targetUser, timeStr, reason = 'Sin razón especificada') {
            const member = ctx.guild.members.cache.get(targetUser.id);
            if (!member) return ctx.reply({ content: '❌ Ese usuario no está en el servidor.', flags: MessageFlags.Ephemeral });
            if (!member.moderatable) return ctx.reply({ content: '❌ No puedo aislar a este usuario.', flags: MessageFlags.Ephemeral });
            if (ctx.member.roles.highest.position <= member.roles.highest.position) return ctx.reply({ content: '❌ Jerarquía de roles insuficiente.', flags: MessageFlags.Ephemeral });

            const duration = ms(timeStr);
            if (!duration || duration > 2419200000) return ctx.reply({ content: '❌ Tiempo inválido (máx 28 días). Ejemplos: 10m, 1h, 1d.', flags: MessageFlags.Ephemeral });

            await member.timeout(duration, reason);
            await ctx.reply({ content: `✅ **${targetUser.tag}** ha sido aislado por **${timeStr}**. Razón: ${reason}` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🔇 Usuario Aislado (Mute)')
                .setColor('#FFFF00')
                .addFields(
                    { name: 'Usuario', value: `${targetUser.tag}`, inline: true },
                    { name: 'Duración', value: timeStr, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                    { name: 'Razón', value: reason }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // UNTIMEOUT / UNMUTE
    {
        name: 'untimeout',
        aliases: ['unmute'],
        description: 'Quita el aislamiento a un usuario.',
        usage: '!!untimeout <@usuario> [razón]',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a liberar.').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('Razón.')),
        async execute(ctx, targetUser, reason = 'Sin razón especificada') {
            const member = ctx.guild.members.cache.get(targetUser.id);
            if (!member) return ctx.reply({ content: '❌ Usuario no encontrado.', flags: MessageFlags.Ephemeral });
            if (!member.isCommunicationDisabled()) return ctx.reply({ content: '❌ Este usuario no está aislado.', flags: MessageFlags.Ephemeral });

            await member.timeout(null, reason);
            await ctx.reply({ content: `✅ Se ha retirado el aislamiento a **${targetUser.tag}**.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🔊 Aislamiento Retirado')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // WARN
    {
        name: 'warn',
        description: 'Advierte a un usuario.',
        usage: '!!warn <@usuario> <razón>',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario a advertir.').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón de la advertencia.').setRequired(true)),
        async execute(ctx, targetUser, reason) {
            if (targetUser.bot) return ctx.reply({ content: '❌ No puedes advertir a un bot.', flags: MessageFlags.Ephemeral });
            
            const warnings = readJSON(warningsPath);
            if (!warnings[ctx.guild.id]) warnings[ctx.guild.id] = {};
            if (!warnings[ctx.guild.id][targetUser.id]) warnings[ctx.guild.id][targetUser.id] = [];

            const warnId = Date.now().toString(36);
            warnings[ctx.guild.id][targetUser.id].push({
                id: warnId,
                reason: reason,
                moderator: ctx.user ? ctx.user.id : ctx.author.id,
                timestamp: Date.now()
            });
            writeJSON(warningsPath, warnings);

            await ctx.reply({ content: `✅ **${targetUser.tag}** ha sido advertido. Razón: ${reason}` });

            const logEmbed = new EmbedBuilder()
                .setTitle('⚠️ Usuario Advertido')
                .setColor('#FFA500')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                    { name: 'Razón', value: reason },
                    { name: 'ID Warn', value: warnId }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // WARNS (LIST)
    {
        name: 'warns',
        description: 'Muestra las advertencias de un usuario.',
        usage: '!!warns <@usuario>',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.').setRequired(true)),
        async execute(ctx, targetUser) {
            const warnings = readJSON(warningsPath);
            const userWarns = warnings[ctx.guild.id]?.[targetUser.id] || [];

            if (userWarns.length === 0) return ctx.reply({ content: `**${targetUser.tag}** no tiene advertencias.` });

            const embed = new EmbedBuilder()
                .setTitle(`Advertencias de ${targetUser.tag}`)
                .setColor('#FFA500')
                .setFooter({ text: `Total: ${userWarns.length}` });

            const description = userWarns.map((w, i) => 
                `**${i + 1}. ID:** \`${w.id}\`\n**Razón:** ${w.reason}\n**Mod:** <@${w.moderator}>\n**Fecha:** <t:${Math.floor(w.timestamp / 1000)}:R>`
            ).join('\n\n');

            embed.setDescription(description.substring(0, 4096));
            await ctx.reply({ embeds: [embed] });
        }
    },
    // UNWARN
    {
        name: 'unwarn',
        description: 'Elimina una advertencia específica.',
        usage: '!!unwarn <@usuario> <id_warn>',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario.').setRequired(true))
            .addStringOption(opt => opt.setName('id_warn').setDescription('El ID de la advertencia.').setRequired(true)),
        async execute(ctx, targetUser, warnId) {
            const warnings = readJSON(warningsPath);
            if (!warnings[ctx.guild.id]?.[targetUser.id]) return ctx.reply({ content: '❌ Este usuario no tiene advertencias.', flags: MessageFlags.Ephemeral });

            const initialLength = warnings[ctx.guild.id][targetUser.id].length;
            warnings[ctx.guild.id][targetUser.id] = warnings[ctx.guild.id][targetUser.id].filter(w => w.id !== warnId);

            if (warnings[ctx.guild.id][targetUser.id].length === initialLength) {
                return ctx.reply({ content: '❌ No se encontró una advertencia con ese ID.', flags: MessageFlags.Ephemeral });
            }

            writeJSON(warningsPath, warnings);
            await ctx.reply({ content: `✅ Advertencia \`${warnId}\` eliminada de **${targetUser.tag}**.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🗑️ Advertencia Eliminada')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Moderador', value: ctx.user ? ctx.user.tag : ctx.author.tag, inline: true },
                    { name: 'ID Warn', value: warnId }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // CLEARWARNS
    {
        name: 'clearwarns',
        description: 'Borra todas las advertencias de un usuario.',
        usage: '!!clearwarns <@usuario>',
        permissions: PermissionFlagsBits.ModerateMembers,
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario.').setRequired(true)),
        async execute(ctx, targetUser) {
            const warnings = readJSON(warningsPath);
            if (!warnings[ctx.guild.id]?.[targetUser.id]) return ctx.reply({ content: '❌ Este usuario no tiene advertencias.', flags: MessageFlags.Ephemeral });

            delete warnings[ctx.guild.id][targetUser.id];
            writeJSON(warningsPath, warnings);

            await ctx.reply({ content: `✅ Se han borrado todas las advertencias de **${targetUser.tag}**.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🗑️ Advertencias Limpiadas')
                .setColor('#00FF00')
                .setDescription(`Se eliminaron todas las advertencias de **${targetUser.tag}**.`)
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // MUTELIST
    {
        name: 'mutelist',
        description: 'Muestra los usuarios aislados (timeout) actualmente.',
        usage: '!!mutelist',
        permissions: PermissionFlagsBits.ModerateMembers,
        async execute(ctx) {
            await ctx.guild.members.fetch(); // Ensure cache is populated
            const mutedMembers = ctx.guild.members.cache.filter(m => m.isCommunicationDisabled());

            if (mutedMembers.size === 0) return ctx.reply({ content: 'No hay usuarios aislados actualmente.' });

            const description = mutedMembers.map(m => 
                `**${m.user.tag}** - Termina <t:${Math.floor(m.communicationDisabledUntilTimestamp / 1000)}:R>`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`🔇 Usuarios Aislados (${mutedMembers.size})`)
                .setColor('#FFFF00')
                .setDescription(description.substring(0, 4096));

            await ctx.reply({ embeds: [embed] });
        }
    },
    // PURGE
    {
        name: 'purge',
        aliases: ['clear'],
        description: 'Elimina una cantidad de mensajes en un canal.',
        usage: '!!purge <cantidad> [@usuario]',
        permissions: PermissionFlagsBits.ManageMessages,
        builder: (builder) => builder
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('Número de mensajes a borrar (1-100).').setRequired(true).setMinValue(1).setMaxValue(100))
            .addUserOption(opt => opt.setName('usuario').setDescription('Filtrar mensajes de un usuario específico.')),
        async execute(ctx, amount, targetUser) {
            const isInteraction = ctx.isChatInputCommand?.();
            const channel = ctx.channel;
            const author = ctx.user || ctx.author;

            if (isInteraction) await ctx.deferReply({ ephemeral: true });

            const messages = await channel.messages.fetch({ limit: amount });
            let filteredMessages = messages;
            if (targetUser) {
                filteredMessages = messages.filter(m => m.author.id === targetUser.id);
            }

            if (filteredMessages.size === 0) {
                const reply = { content: 'No se encontraron mensajes para borrar.' };
                return isInteraction ? ctx.editReply(reply) : ctx.reply(reply);
            }

            const deleted = await channel.bulkDelete(filteredMessages, true);

            const reply = { content: `✅ Se han borrado ${deleted.size} mensajes.` };
            if (isInteraction) await ctx.editReply(reply);
            else await ctx.channel.send(reply).then(m => setTimeout(() => m.delete(), 5000));

            const logEmbed = new EmbedBuilder()
                .setTitle('🗑️ Mensajes Purgados')
                .setColor('#FFA500')
                .addFields(
                    { name: 'Canal', value: `${channel}`, inline: true },
                    { name: 'Cantidad', value: `${deleted.size}`, inline: true },
                    { name: 'Moderador', value: author.tag, inline: true }
                )
                .setTimestamp();
            if (targetUser) logEmbed.addFields({ name: 'Usuario Filtrado', value: targetUser.tag });
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // SLOWMODE
    {
        name: 'slowmode',
        description: 'Establece el modo lento en un canal.',
        usage: '!!slowmode <tiempo> [razón]',
        permissions: PermissionFlagsBits.ManageChannels,
        builder: (builder) => builder
            .addStringOption(opt => opt.setName('tiempo').setDescription('Duración (ej. 10s, 5m, 1h, 0 para desactivar).').setRequired(true))
            .addStringOption(opt => opt.setName('razon').setDescription('La razón del cambio.')),
        async execute(ctx, timeStr, reason = 'Sin razón especificada') {
            const seconds = timeStr === '0' ? 0 : ms(timeStr) / 1000;
            if (isNaN(seconds) || seconds < 0 || seconds > 21600) { // max 6 hours
                return ctx.reply({ content: '❌ Tiempo inválido. Usa un formato como `10s`, `5m`, `1h` o `0` para desactivar (máx 6h).', flags: MessageFlags.Ephemeral });
            }

            await ctx.channel.setRateLimitPerUser(seconds, reason);
            
            const message = seconds > 0 
                ? `✅ Modo lento establecido a **${timeStr}**.`
                : '✅ Modo lento desactivado.';
            await ctx.reply({ content: message });

            const logEmbed = new EmbedBuilder()
                .setTitle('⏳ Modo Lento Actualizado')
                .setColor('#AEC6CF')
                .addFields(
                    { name: 'Canal', value: `${ctx.channel}`, inline: true },
                    { name: 'Nueva Duración', value: timeStr, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                )
                .setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // CHANNEL LOCK
    {
        name: 'channel-lock',
        description: 'Bloquea el canal actual para que los usuarios no puedan escribir.',
        usage: '!!channel-lock [razón]',
        permissions: PermissionFlagsBits.ManageChannels,
        builder: (builder) => builder.addStringOption(opt => opt.setName('razon').setDescription('Razón del bloqueo.')),
        async execute(ctx, reason = 'Sin razón especificada') {
            const channel = ctx.channel;
            await channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: false });
            await ctx.reply(`🔒 Canal bloqueado. Razón: ${reason}`);
            
            const logEmbed = new EmbedBuilder()
                .setTitle('🔒 Canal Bloqueado')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Canal', value: `${channel}`, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true },
                    { name: 'Razón', value: reason }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // CHANNEL UNLOCK
    {
        name: 'channel-unlock',
        description: 'Desbloquea el canal actual.',
        usage: '!!channel-unlock',
        permissions: PermissionFlagsBits.ManageChannels,
        async execute(ctx) {
            const channel = ctx.channel;
            await channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: null });
            await ctx.reply('🔓 Canal desbloqueado.');

            const logEmbed = new EmbedBuilder()
                .setTitle('🔓 Canal Desbloqueado')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Canal', value: `${channel}`, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // NICK SET
    {
        name: 'nick-set',
        description: 'Cambia el apodo de un usuario.',
        usage: '!!nick-set <@usuario> <apodo>',
        permissions: PermissionFlagsBits.ManageNicknames,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('Usuario.').setRequired(true))
            .addStringOption(opt => opt.setName('apodo').setDescription('Nuevo apodo.').setRequired(true)),
        async execute(ctx, targetUser, nickname) {
            const member = await ctx.guild.members.fetch(targetUser.id);
            const oldNick = member.nickname || member.user.username;
            await member.setNickname(nickname);
            await ctx.reply(`✅ Apodo de **${targetUser.tag}** cambiado a **${nickname}**.`);

            const logEmbed = new EmbedBuilder()
                .setTitle('🏷️ Apodo Cambiado')
                .setColor('#AEC6CF')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true },
                    { name: 'Antes', value: oldNick, inline: true },
                    { name: 'Ahora', value: nickname, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // NICK UNSET
    {
        name: 'nick-unset',
        description: 'Restablece el apodo de un usuario.',
        usage: '!!nick-unset <@usuario>',
        permissions: PermissionFlagsBits.ManageNicknames,
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('Usuario.').setRequired(true)),
        async execute(ctx, targetUser) {
            const member = await ctx.guild.members.fetch(targetUser.id);
            const oldNick = member.nickname || 'Ninguno';
            await member.setNickname(null);
            await ctx.reply(`✅ Apodo de **${targetUser.tag}** restablecido.`);

            const logEmbed = new EmbedBuilder()
                .setTitle('🏷️ Apodo Restablecido')
                .setColor('#AEC6CF')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true },
                    { name: 'Anterior', value: oldNick, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // ROLE ADD
    {
        name: 'role-add',
        description: 'Añade un rol a un usuario.',
        usage: '!!role-add <@usuario> <@rol>',
        permissions: PermissionFlagsBits.ManageRoles,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('Usuario.').setRequired(true))
            .addRoleOption(opt => opt.setName('rol').setDescription('Rol a añadir.').setRequired(true)),
        async execute(ctx, targetUser, role) {
            const member = await ctx.guild.members.fetch(targetUser.id);
            if (ctx.member.roles.highest.position <= role.position) {
                return ctx.reply({ content: '❌ No puedes gestionar un rol superior o igual al tuyo.', flags: MessageFlags.Ephemeral });
            }
            await member.roles.add(role);
            await ctx.reply(`✅ Rol **${role.name}** añadido a **${targetUser.tag}**.`);

            const logEmbed = new EmbedBuilder()
                .setTitle('➕ Rol Añadido')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Rol', value: role.name, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // ROLE REMOVE
    {
        name: 'role-remove',
        description: 'Quita un rol a un usuario.',
        usage: '!!role-remove <@usuario> <@rol>',
        permissions: PermissionFlagsBits.ManageRoles,
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('Usuario.').setRequired(true))
            .addRoleOption(opt => opt.setName('rol').setDescription('Rol a quitar.').setRequired(true)),
        async execute(ctx, targetUser, role) {
            const member = await ctx.guild.members.fetch(targetUser.id);
            if (ctx.member.roles.highest.position <= role.position) {
                return ctx.reply({ content: '❌ No puedes gestionar un rol superior o igual al tuyo.', flags: MessageFlags.Ephemeral });
            }
            await member.roles.remove(role);
            await ctx.reply(`✅ Rol **${role.name}** quitado de **${targetUser.tag}**.`);

            const logEmbed = new EmbedBuilder()
                .setTitle('➖ Rol Quitado')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Usuario', value: targetUser.tag, inline: true },
                    { name: 'Rol', value: role.name, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // MASSROLE ADD
    {
        name: 'massrole-add',
        description: 'Añade un rol a todos los usuarios (humanos o bots).',
        usage: '!!massrole-add <@rol> <humans|bots|all>',
        permissions: PermissionFlagsBits.Administrator,
        builder: (builder) => builder
            .addRoleOption(opt => opt.setName('rol').setDescription('Rol a añadir.').setRequired(true))
            .addStringOption(opt => opt.setName('objetivo').setDescription('A quiénes (humans, bots, all).').setRequired(true).addChoices({ name: 'Humanos', value: 'humans' }, { name: 'Bots', value: 'bots' }, { name: 'Todos', value: 'all' })),
        async execute(ctx, role, targetType) {
            if (ctx.member.roles.highest.position <= role.position) return ctx.reply('❌ Rol demasiado alto.');
            
            const msg = await ctx.reply('🔄 Procesando massrole... esto puede tardar.');
            const members = await ctx.guild.members.fetch();
            let count = 0;

            for (const member of members.values()) {
                if (member.roles.cache.has(role.id)) continue;
                if (targetType === 'humans' && member.user.bot) continue;
                if (targetType === 'bots' && !member.user.bot) continue;
                
                try {
                    await member.roles.add(role);
                    count++;
                } catch (e) {}
            }

            const replyContent = `✅ Rol **${role.name}** añadido a ${count} miembros.`;
            if (ctx.isChatInputCommand?.()) await ctx.editReply(replyContent);
            else await msg.edit(replyContent);

            const logEmbed = new EmbedBuilder()
                .setTitle('👥 Massrole Add')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Rol', value: role.name, inline: true },
                    { name: 'Objetivo', value: targetType, inline: true },
                    { name: 'Afectados', value: `${count}`, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // MASSROLE REMOVE
    {
        name: 'massrole-remove',
        description: 'Quita un rol a todos los usuarios.',
        usage: '!!massrole-remove <@rol> <humans|bots|all>',
        permissions: PermissionFlagsBits.Administrator,
        builder: (builder) => builder
            .addRoleOption(opt => opt.setName('rol').setDescription('Rol a quitar.').setRequired(true))
            .addStringOption(opt => opt.setName('objetivo').setDescription('A quiénes (humans, bots, all).').setRequired(true).addChoices({ name: 'Humanos', value: 'humans' }, { name: 'Bots', value: 'bots' }, { name: 'Todos', value: 'all' })),
        async execute(ctx, role, targetType) {
            if (ctx.member.roles.highest.position <= role.position) return ctx.reply('❌ Rol demasiado alto.');

            const msg = await ctx.reply('🔄 Procesando massrole... esto puede tardar.');
            const members = await ctx.guild.members.fetch();
            let count = 0;

            for (const member of members.values()) {
                if (!member.roles.cache.has(role.id)) continue;
                if (targetType === 'humans' && member.user.bot) continue;
                if (targetType === 'bots' && !member.user.bot) continue;

                try {
                    await member.roles.remove(role);
                    count++;
                } catch (e) {}
            }

            const replyContent = `✅ Rol **${role.name}** quitado de ${count} miembros.`;
            if (ctx.isChatInputCommand?.()) await ctx.editReply(replyContent);
            else await msg.edit(replyContent);

            const logEmbed = new EmbedBuilder()
                .setTitle('👥 Massrole Remove')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Rol', value: role.name, inline: true },
                    { name: 'Objetivo', value: targetType, inline: true },
                    { name: 'Afectados', value: `${count}`, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    },
    // ROLE COLOR
    {
        name: 'role-color',
        description: 'Cambia el color de un rol.',
        usage: '!!role-color <@rol> <hex_color>',
        permissions: PermissionFlagsBits.ManageRoles,
        builder: (builder) => builder
            .addRoleOption(opt => opt.setName('rol').setDescription('Rol a editar.').setRequired(true))
            .addStringOption(opt => opt.setName('color').setDescription('Color Hex (ej. #FF0000).').setRequired(true)),
        async execute(ctx, role, color) {
            if (ctx.member.roles.highest.position <= role.position) return ctx.reply('❌ Rol demasiado alto.');
            
            const oldColor = role.hexColor;
            await role.setColor(color);
            await ctx.reply(`✅ Color del rol **${role.name}** cambiado a **${color}**.`);

            const logEmbed = new EmbedBuilder()
                .setTitle('🎨 Color de Rol Cambiado')
                .setColor(color)
                .addFields(
                    { name: 'Rol', value: role.name, inline: true },
                    { name: 'Antes', value: oldColor, inline: true },
                    { name: 'Ahora', value: color, inline: true },
                    { name: 'Moderador', value: (ctx.user || ctx.author).tag, inline: true }
                ).setTimestamp();
            await sendLog(ctx.guild, logEmbed);
        }
    }
];

// --- Dynamic Command Builder ---
module.exports = commands.map(cmdConfig => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdConfig.name)
            .setDescription(cmdConfig.description)
            .setDefaultMemberPermissions(cmdConfig.permissions),
        category: 'mod',
        description: cmdConfig.description,
        usage: cmdConfig.usage,
        aliases: cmdConfig.aliases || [],
        
        async execute(message, args) {
            if (!message.member.permissions.has(cmdConfig.permissions)) {
                return message.reply('❌ No tienes permisos para usar este comando.');
            }

            // Argument parsing for prefix commands
            if (['ban', 'kick', 'warn', 'warns', 'clearwarns'].includes(cmdConfig.name)) {
                const target = message.mentions.users.first();
                if (!target) return message.reply('❌ Debes mencionar a un usuario.');
                const reason = args.slice(1).join(' ') || 'Sin razón especificada';
                return cmdConfig.execute(message, target, reason);
            }
            if (cmdConfig.name === 'unban') {
                const targetId = args[0];
                if (!targetId) return message.reply('❌ Debes especificar el ID del usuario.');
                const reason = args.slice(1).join(' ') || 'Sin razón especificada';
                return cmdConfig.execute(message, targetId, reason);
            }
            if (['timeout', 'untimeout'].includes(cmdConfig.name)) {
                const target = message.mentions.users.first();
                if (!target) return message.reply('❌ Debes mencionar a un usuario.');
                
                if (cmdConfig.name === 'timeout') {
                    const time = args[1];
                    if (!time) return message.reply('❌ Debes especificar el tiempo (ej. 10m).');
                    const reason = args.slice(2).join(' ') || 'Sin razón especificada';
                    return cmdConfig.execute(message, target, time, reason);
                } else {
                    const reason = args.slice(1).join(' ') || 'Sin razón especificada';
                    return cmdConfig.execute(message, target, reason);
                }
            }
            if (cmdConfig.name === 'unwarn') {
                const target = message.mentions.users.first();
                const warnId = args[1];
                if (!target || !warnId) return message.reply('❌ Uso: `!!unwarn @usuario <id_warn>`');
                return cmdConfig.execute(message, target, warnId);
            }
            if (cmdConfig.name === 'purge') {
                const amount = parseInt(args[0]);
                if (!amount) return message.reply('❌ Debes especificar una cantidad.');
                const target = message.mentions.users.first(); // Can be null
                return cmdConfig.execute(message, amount, target);
            }
            if (cmdConfig.name === 'slowmode') {
                const time = args[0];
                if (!time) return message.reply('❌ Debes especificar el tiempo.');
                const reason = args.slice(1).join(' ') || 'Sin razón especificada';
                return cmdConfig.execute(message, time, reason);
            }
            if (cmdConfig.name === 'channel-lock') {
                const reason = args.join(' ') || 'Sin razón especificada';
                return cmdConfig.execute(message, reason);
            }
            if (cmdConfig.name === 'nick-set') {
                const target = message.mentions.users.first();
                const nick = args.slice(1).join(' ');
                if (!target || !nick) return message.reply('❌ Uso: `!!nick-set @usuario <apodo>`');
                return cmdConfig.execute(message, target, nick);
            }
            if (cmdConfig.name === 'nick-unset') {
                const target = message.mentions.users.first();
                if (!target) return message.reply('❌ Debes mencionar a un usuario.');
                return cmdConfig.execute(message, target);
            }
            if (['role-add', 'role-remove'].includes(cmdConfig.name)) {
                const target = message.mentions.users.first();
                const role = message.mentions.roles.first();
                if (!target || !role) return message.reply('❌ Uso: `!!comando @usuario @rol`');
                return cmdConfig.execute(message, target, role);
            }
            if (['massrole-add', 'massrole-remove'].includes(cmdConfig.name)) {
                const role = message.mentions.roles.first();
                const type = args[1];
                if (!role || !type) return message.reply('❌ Uso: `!!comando @rol <humans|bots|all>`');
                return cmdConfig.execute(message, role, type);
            }
            if (cmdConfig.name === 'role-color') {
                const role = message.mentions.roles.first();
                const color = args[1];
                if (!role || !color) return message.reply('❌ Uso: `!!role-color @rol #HEX`');
                return cmdConfig.execute(message, role, color);
            }

            return cmdConfig.execute(message);
        },

        async executeSlash(interaction) {
            // Slash commands handle permissions automatically via setDefaultMemberPermissions
            // Argument parsing is handled by the builder in the command config
			const options = interaction.options;
            const reason = options.getString('razon');

            switch(cmdConfig.name) {
                case 'ban':
                case 'kick':
                case 'warn':
                case 'warns':
                case 'clearwarns':
                case 'untimeout':
                    return cmdConfig.execute(interaction, options.getUser('usuario'), reason);
                case 'unban':
                    return cmdConfig.execute(interaction, options.getString('usuario_id'), reason);
                case 'timeout':
                    return cmdConfig.execute(interaction, options.getUser('usuario'), options.getString('tiempo'), reason);
                case 'unwarn':
                    return cmdConfig.execute(interaction, options.getUser('usuario'), options.getString('id_warn'));
                case 'purge':
                    return cmdConfig.execute(interaction, options.getInteger('cantidad'), options.getUser('usuario'));
                case 'slowmode':
                    return cmdConfig.execute(interaction, options.getString('tiempo'), reason);
                case 'mutelist':
                     return cmdConfig.execute(interaction);
                case 'channel-lock':
                    return cmdConfig.execute(interaction, reason);
                case 'channel-unlock':
                    return cmdConfig.execute(interaction);
                case 'massrole-add':
                case 'massrole-remove':
                    return cmdConfig.execute(interaction, options.getRole('rol'), options.getString('objetivo'));
                case 'nick-set':
                    return cmdConfig.execute(interaction, options.getUser('usuario'), options.getString('apodo'));
                case 'nick-unset':
                    return cmdConfig.execute(interaction, options.getUser('usuario'));
                case 'role-add':
                case 'role-remove':
                    return cmdConfig.execute(interaction, options.getUser('usuario'), options.getRole('rol'));
                case 'role-color':
                    return cmdConfig.execute(interaction, options.getRole('rol'), options.getString('color'));
                default:
                    return interaction.reply({ content: 'Error: Interacción de moderación no reconocida.', ephemeral: true });
            }
        }
    };
    if (cmdConfig.builder) {
        cmdConfig.builder(command.data);
    }
    return command;
});