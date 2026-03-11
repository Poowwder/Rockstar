const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

// --- 📂 GESTIÓN DE PERSISTENCIA ---
const configPath = path.join(__dirname, '../data/config.json');
const warningsPath = path.join(__dirname, '../data/warnings.json');

const readData = (p) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
const writeData = (p, d) => {
    if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(d, null, 2));
};

// --- 🛰️ SISTEMA DE LOGS ---
async function sendLog(guild, embed) {
    const config = readData(configPath);
    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (logChannel) await logChannel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = {
    name: 'moderation',
    description: 'Panel administrativo de Rockstar Nightfall.',
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('👑 Comandos de moderación avanzada')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        // Subcomandos (Se mantienen todos los de tu lista original)
        .addSubcommand(s => s.setName('ban').setDescription('Banea a un usuario.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')))
        .addSubcommand(s => s.setName('unban').setDescription('Desbanea por ID.').addStringOption(o => o.setName('id').setDescription('ID del usuario').setRequired(true)))
        .addSubcommand(s => s.setName('kick').setDescription('Expulsa a un usuario.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')))
        .addSubcommand(s => s.setName('mute').setDescription('Silencia (Rol Muted).').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('10m, 1h, 1d')).addStringOption(o => o.setName('razon').setDescription('Razón')))
        .addSubcommand(s => s.setName('unmute').setDescription('Quita el rol de silencio.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('timeout').setDescription('Silencio nativo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('Ej: 1h').setRequired(true)))
        .addSubcommand(s => s.setName('untimeout').setDescription('Quita el timeout nativo.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('warn').setDescription('Añade advertencia.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)))
        .addSubcommand(s => s.setName('warns').setDescription('Ver historial.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('clearwarns').setDescription('Limpia historial.').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)))
        .addSubcommand(s => s.setName('purge').setDescription('Limpia mensajes.').addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true)))
        .addSubcommand(s => s.setName('nuke').setDescription('Recrea el canal.'))
        .addSubcommand(s => s.setName('lock').setDescription('Bloquea el canal.'))
        .addSubcommand(s => s.setName('unlock').setDescription('Desbloquea el canal.'))
        .addSubcommand(s => s.setName('setlogs').setDescription('Configura logs.').addChannelOption(o => o.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true))),

    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        const { guild, member: modMember, channel, user: modUser } = interaction;

        // --- 1. BAN / KICK / UNBAN ---
        if (['ban', 'kick', 'unban'].includes(sub)) {
            if (sub === 'unban') {
                const id = interaction.options.getString('id');
                return guild.members.unban(id)
                    .then(() => interaction.reply(`╰┈➤ ✅ ID \`${id}\` ha sido restaurada en las sombras.`))
                    .catch(() => interaction.reply('❌ La ID no es válida o no está baneada.'));
            }
            const user = interaction.options.getUser('usuario');
            const target = guild.members.cache.get(user.id);
            if (target && modMember.roles.highest.position <= target.roles.highest.position) return interaction.reply('❌ Jerarquía insuficiente.');
            
            sub === 'ban' ? await guild.members.ban(user) : await target.kick();
            await interaction.reply(`╰┈➤ ⚖️ **${user.tag}** ha sido ${sub === 'ban' ? 'eliminado' : 'expulsado'} del servidor.`);
        }

        // --- 2. MUTE SYSTEM (ROL) ---
        if (sub === 'mute' || sub === 'unmute') {
            const user = interaction.options.getUser('usuario');
            const target = await guild.members.fetch(user.id);
            let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

            if (!muteRole) {
                muteRole = await guild.roles.create({ name: 'Muted', color: '#1a1a1a', permissions: [] });
                guild.channels.cache.forEach(ch => { if (ch.isTextBased()) ch.permissionOverwrites.create(muteRole, { SendMessages: false }).catch(() => {}); });
            }

            if (sub === 'mute') {
                const time = interaction.options.getString('tiempo');
                await target.roles.add(muteRole);
                if (time) setTimeout(() => target.roles.remove(muteRole).catch(() => {}), ms(time));
                await interaction.reply(`╰┈➤ 🤐 **${user.tag}** ha sido silenciado.`);
            } else {
                await target.roles.remove(muteRole);
                await interaction.reply(`╰┈➤ 🔊 **${user.tag}** recuperó su voz.`);
            }
        }

        // --- 3. WARN SYSTEM ---
        if (['warn', 'warns', 'clearwarns'].includes(sub)) {
            const user = interaction.options.getUser('usuario');
            let warns = readData(warningsPath);
            if (!warns[guild.id]) warns[guild.id] = {};
            if (!warns[guild.id][user.id]) warns[guild.id][user.id] = [];

            if (sub === 'warn') {
                const reason = interaction.options.getString('razon');
                warns[guild.id][user.id].push({ id: Date.now().toString(36), reason, mod: modUser.id });
                writeData(warningsPath, warns);
                await interaction.reply(`╰┈➤ ⚠️ **Advertencia aplicada:** ${user.tag} | Motivo: ${reason}`);
            } else if (sub === 'warns') {
                const list = warns[guild.id][user.id];
                const embed = new EmbedBuilder()
                    .setTitle(`Historial de Sombras: ${user.username}`)
                    .setColor('#1a1a1a')
                    .setDescription(list.length ? list.map(w => `\`${w.id}\` - **${w.reason}** (por <@${w.mod}>)`).join('\n') : 'Limpio de pecados.');
                await interaction.reply({ embeds: [embed] });
            } else if (sub === 'clearwarns') {
                warns[guild.id][user.id] = [];
                writeData(warningsPath, warns);
                await interaction.reply(`╰┈➤ ✨ Historial de advertencias purificado para ${user.tag}.`);
            }
        }

        // --- 4. CANAL (PURGE / NUKE / LOCK) ---
        if (sub === 'purge') {
            const amount = interaction.options.getInteger('cantidad');
            await channel.bulkDelete(amount, true);
            return interaction.reply({ content: `╰┈➤ 🧹 Se han incinerado **${amount}** mensajes.`, flags: MessageFlags.Ephemeral });
        }
        if (sub === 'nuke') {
            const pos = channel.position;
            const newCh = await channel.clone();
            await channel.delete();
            await newCh.setPosition(pos);
            await newCh.send({ embeds: [new EmbedBuilder().setColor('#1a1a1a').setTitle('💥 CANAL RECONSTRUIDO').setImage('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')] });
        }
        if (sub === 'lock' || sub === 'unlock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: sub === 'unlock' ? null : false });
            return interaction.reply(`╰┈➤ 🔒 Canal **${sub === 'lock' ? 'BLOQUEADO' : 'DESBLOQUEADO'}**.`);
        }

        // --- 5. CONFIG ---
        if (sub === 'setlogs') {
            const logCh = interaction.options.getChannel('canal');
            let config = readData(configPath);
            config.logChannelId = logCh.id;
            writeData(configPath, config);
            return interaction.reply(`╰┈➤ ✅ Canal de vigilancia establecido en <#${logCh.id}>.`);
        }
    }
};
