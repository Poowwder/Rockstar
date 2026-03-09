const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

// --- RUTAS Y HELPERS DE DATOS ---
const configPath = path.join(__dirname, '../data/config.json');
const warningsPath = path.join(__dirname, '../data/warnings.json');

function readData(filePath) {
    if (!fs.existsSync(filePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) { return {}; }
}

function writeData(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function sendLog(guild, embed) {
    const config = readData(configPath);
    const logChannelId = config.logChannelId;
    if (!logChannelId) return;
    const channel = guild.channels.cache.get(logChannelId);
    if (channel) await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('Panel administrativo supremo R☆ckstar ✨')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        // --- SECCIÓN: EXPULSIÓN ---
        .addSubcommand(s => s.setName('ban').setDescription('Banea a un usuario.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')))
        .addSubcommand(s => s.setName('unban').setDescription('Desbanea por ID.').addStringOption(o => o.setName('id').setDescription('ID del usuario').setRequired(true)))
        .addSubcommand(s => s.setName('kick').setDescription('Expulsa a un usuario.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')))
        // --- SECCIÓN: SILENCIO (MUTE/TIMEOUT) ---
        .addSubcommand(s => s.setName('mute').setDescription('Silencia (Rol Muted).').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('10m, 1h, 1d')).addStringOption(o => o.setName('razon').setDescription('Razón')))
        .addSubcommand(s => s.setName('unmute').setDescription('Quita el rol de silencio.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('timeout').setDescription('Silencio nativo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('Ej: 1h').setRequired(true)))
        .addSubcommand(s => s.setName('untimeout').setDescription('Quita el timeout nativo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        // --- SECCIÓN: ADVERTENCIAS ---
        .addSubcommand(s => s.setName('warn').setDescription('Añade advertencia.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)))
        .addSubcommand(s => s.setName('warns').setDescription('Ver historial.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('unwarn').setDescription('Borra un warn por ID.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('id').setDescription('ID del warn').setRequired(true)))
        .addSubcommand(s => s.setName('clearwarns').setDescription('Limpia historial.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        // --- SECCIÓN: CANALES ---
        .addSubcommand(s => s.setName('purge').setDescription('Limpia mensajes.').addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true)))
        .addSubcommand(s => s.setName('nuke').setDescription('Recrea el canal.'))
        .addSubcommand(s => s.setName('lock').setDescription('Bloquea el canal.'))
        .addSubcommand(s => s.setName('unlock').setDescription('Desbloquea el canal.'))
        .addSubcommand(s => s.setName('slowmode').setDescription('Ajusta o quita el slowmode.').addStringOption(o => o.setName('tiempo').setDescription('10s, 1m, 0').setRequired(true)))
        // --- SECCIÓN: PERFILES Y ROLES ---
        .addSubcommand(s => s.setName('nick-set').setDescription('Cambia apodo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('apodo').setDescription('Apodo').setRequired(true)))
        .addSubcommand(s => s.setName('nick-remove').setDescription('Resetea el apodo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('role-add').setDescription('Añade rol.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)))
        .addSubcommand(s => s.setName('role-remove').setDescription('Quita rol.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)))
        .addSubcommand(s => s.setName('massrole-add').setDescription('Rol a todos.').addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).addStringOption(o => o.setName('tipo').setDescription('Objetivo').setRequired(true).addChoices({name:'Todos', value:'all'}, {name:'Humanos', value:'humans'}, {name:'Bots', value:'bots'})))
        .addSubcommand(s => s.setName('massrole-remove').setDescription('Quita rol a todos.').addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).addStringOption(o => o.setName('tipo').setDescription('Objetivo').setRequired(true).addChoices({name:'Todos', value:'all'}, {name:'Humanos', value:'humans'}, {name:'Bots', value:'bots'})))
        // --- SECCIÓN: CONFIG ---
        .addSubcommand(s => s.setName('setlogs').setDescription('Configura logs.').addChannelOption(o => o.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(s => s.setName('setup').setDescription('Ver configuración del servidor.')),

    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        const { guild, member: modMember, channel, user: modUser } = interaction;

        // 1. MUTE / UNMUTE (Lógica de Rol)
        if (sub === 'mute' || sub === 'unmute') {
            const user = interaction.options.getUser('usuario');
            const target = await guild.members.fetch(user.id);
            let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

            if (!muteRole) {
                muteRole = await guild.roles.create({ name: 'Muted', color: '#000000', permissions: [] });
                guild.channels.cache.forEach(ch => { if (ch.isTextBased()) ch.permissionOverwrites.create(muteRole, { SendMessages: false }).catch(() => {}); });
            }

            if (sub === 'mute') {
                const time = interaction.options.getString('tiempo');
                const reason = interaction.options.getString('razon') || 'Sin razón';
                if (target.roles.highest.position >= modMember.roles.highest.position) return interaction.reply('❌ Jerarquía insuficiente.');
                await target.roles.add(muteRole);
                if (time) setTimeout(async () => { if (target.roles.cache.has(muteRole.id)) await target.roles.remove(muteRole); }, ms(time));
                await interaction.reply(`✅ **${user.tag}** silenciado correctamente. ✨`);
            } else {
                await target.roles.remove(muteRole);
                await interaction.reply(`✅ **${user.tag}** puede hablar de nuevo. ✨`);
            }
        }

        // 2. NICK GESTIÓN
        if (sub === 'nick-set' || sub === 'nick-remove') {
            const user = interaction.options.getUser('usuario');
            const target = await guild.members.fetch(user.id);
            if (!target.manageable) return interaction.reply('❌ No puedo modificar a este usuario.');
            const newNick = sub === 'nick-set' ? interaction.options.getString('apodo') : null;
            await target.setNickname(newNick);
            return interaction.reply(`✅ Apodo de **${user.tag}** ${newNick ? 'cambiado' : 'reseteado'}. ✨`);
        }

        // 3. SLOWMODE
        if (sub === 'slowmode') {
            const timeStr = interaction.options.getString('tiempo');
            const sec = timeStr === '0' ? 0 : ms(timeStr) / 1000;
            await channel.setRateLimitPerUser(sec);
            return interaction.reply(`✅ Modo lento: **${timeStr === '0' ? 'Desactivado' : timeStr}**. ✨`);
        }

        // 4. BAN / KICK / UNBAN
        if (sub === 'ban' || sub === 'kick') {
            const user = interaction.options.getUser('usuario');
            const target = guild.members.cache.get(user.id);
            if (target && modMember.roles.highest.position <= target.roles.highest.position) return interaction.reply('❌ Jerarquía insuficiente.');
            sub === 'ban' ? await guild.members.ban(user) : await target.kick();
            await interaction.reply(`✅ **${user.tag}** ha sido ${sub === 'ban' ? 'baneado' : 'expulsado'}. ✨`);
        }
        if (sub === 'unban') {
            const id = interaction.options.getString('id');
            await guild.members.unban(id).then(() => interaction.reply(`✅ ID **${id}** desbaneada. ✨`)).catch(() => interaction.reply('❌ ID inválida.'));
        }

        // 5. TIMEOUT / UNTIMEOUT
        if (sub === 'timeout' || sub === 'untimeout') {
            const user = interaction.options.getUser('usuario');
            const target = await guild.members.fetch(user.id);
            if (sub === 'timeout') {
                const duration = ms(interaction.options.getString('tiempo'));
                await target.timeout(duration);
                await interaction.reply(`✅ **${user.tag}** en timeout. ✨`);
            } else {
                await target.timeout(null);
                await interaction.reply(`✅ Timeout removido de **${user.tag}**. ✨`);
            }
        }

        // 6. WARN SYSTEM
        if (['warn', 'warns', 'unwarn', 'clearwarns'].includes(sub)) {
            const user = interaction.options.getUser('usuario');
            let warns = readData(warningsPath);
            if (!warns[guild.id]) warns[guild.id] = {};
            if (!warns[guild.id][user.id]) warns[guild.id][user.id] = [];

            if (sub === 'warn') {
                const reason = interaction.options.getString('razon');
                warns[guild.id][user.id].push({ id: Date.now().toString(36), reason, mod: modUser.id });
                writeData(warningsPath, warns);
                await interaction.reply(`⚠️ **${user.tag}** advertido por: ${reason} ✨`);
            } else if (sub === 'warns') {
                const list = warns[guild.id][user.id];
                const embed = new EmbedBuilder().setTitle(`Warns: ${user.tag}`).setColor('#FFB6C1').setDescription(list.length ? list.map(w => `\`${w.id}\` - ${w.reason}`).join('\n') : 'Sin advertencias.');
                await interaction.reply({ embeds: [embed] });
            } else if (sub === 'unwarn') {
                const id = interaction.options.getString('id');
                warns[guild.id][user.id] = warns[guild.id][user.id].filter(w => w.id !== id);
                writeData(warningsPath, warns);
                await interaction.reply(`✅ Warn eliminado. ✨`);
            } else if (sub === 'clearwarns') {
                warns[guild.id][user.id] = [];
                writeData(warningsPath, warns);
                await interaction.reply(`✅ Historial borrado. ✨`);
            }
        }

        // 7. ROLES (Add, Remove, Mass)
        if (sub === 'role-add' || sub === 'role-remove') {
            const role = interaction.options.getRole('rol');
            const target = await guild.members.fetch(interaction.options.getUser('usuario').id);
            if (role.position >= modMember.roles.highest.position) return interaction.reply('❌ No puedes gestionar ese rol.');
            sub === 'role-add' ? await target.roles.add(role) : await target.roles.remove(role);
            await interaction.reply(`✅ Rol **${role.name}** actualizado. ✨`);
        }

        if (sub === 'massrole-add' || sub === 'massrole-remove') {
            await interaction.deferReply();
            const role = interaction.options.getRole('rol');
            const type = interaction.options.getString('tipo');
            const members = await guild.members.fetch();
            let count = 0;
            for (const m of members.values()) {
                if ((type === 'humans' && m.user.bot) || (type === 'bots' && !m.user.bot)) continue;
                try {
                    if (sub === 'massrole-add' && !m.roles.cache.has(role.id)) { await m.roles.add(role); count++; }
                    if (sub === 'massrole-remove' && m.roles.cache.has(role.id)) { await m.roles.remove(role); count++; }
                } catch {}
            }
            await interaction.editReply(`✅ Operación masiva completa (${count} miembros). ✨`);
        }

        // 8. CANAL (Purge, Nuke, Lock)
        if (sub === 'purge') {
            const amount = interaction.options.getInteger('cantidad');
            await channel.bulkDelete(amount, true);
            return interaction.reply({ content: `✅ Mensajes borrados. ✨`, flags: MessageFlags.Ephemeral });
        }
        if (sub === 'nuke') {
            const pos = channel.position;
            const newCh = await channel.clone();
            await channel.delete();
            await newCh.setPosition(pos);
            await newCh.send({ embeds: [new EmbedBuilder().setColor('#FFB6C1').setTitle('💥 Canal Reconstruido').setImage('https://i.imgur.com/8N7An9V.gif')] });
        }
        if (sub === 'lock' || sub === 'unlock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: sub === 'unlock' ? null : false });
            return interaction.reply(`✅ Canal **${sub}ed**. ✨`);
        }

        // 9. CONFIGURACIÓN (Setlogs, Setup)
        if (sub === 'setlogs') {
            const logCh = interaction.options.getChannel('canal');
            let config = readData(configPath);
            config.logChannelId = logCh.id;
            writeData(configPath, config);
            return interaction.reply(`✅ Logs activados en <#${logCh.id}>. ✨`);
        }

        if (sub === 'setup') {
            const config = readData(configPath);
            const embed = new EmbedBuilder()
                .setTitle('🎀 Rockstar Setup')
                .setColor('#FFB6C1')
                .addFields({ name: 'Logs', value: config.logChannelId ? `<#${config.logChannelId}>` : '❌ Desactivado' })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }
    }
};