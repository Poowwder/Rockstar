const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

// Almacenamiento en memoria para recordatorios (se borran al reiniciar el bot)
const reminders = new Map();

const commands = [
    { 
        name: 'embed', 
        description: 'Crea un embed simple.',
        builder: b => b.addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true)).addStringOption(o => o.setName('descripcion').setDescription('Descripción').setRequired(true)),
        async execute(ctx, title, desc) {
            const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor('Random');
            await ctx.reply({ embeds: [embed] });
        }
    },
    { 
        name: 'inviteinfo', 
        description: 'Muestra información de una invitación.',
        builder: b => b.addStringOption(o => o.setName('codigo').setDescription('Código de invitación').setRequired(true)),
        async execute(ctx, code) {
            try {
                const invite = await ctx.client.fetchInvite(code);
                const embed = new EmbedBuilder()
                    .setTitle(`Invitación a ${invite.guild.name}`)
                    .addFields(
                        { name: 'Servidor', value: invite.guild.name, inline: true },
                        { name: 'Miembros', value: `${invite.memberCount}`, inline: true },
                        { name: 'Canal', value: invite.channel.name, inline: true }
                    );
                await ctx.reply({ embeds: [embed] });
            } catch (e) {
                await ctx.reply('❌ Invitación inválida o expirada.');
            }
        }
    },
    { 
        name: 'reminder', 
        description: 'Gestiona tus recordatorios.',
        builder: b => b
            .addSubcommand(s => s.setName('set').setDescription('Crea un recordatorio.').addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true)).addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)))
            .addSubcommand(s => s.setName('list').setDescription('Lista tus recordatorios.'))
            .addSubcommand(s => s.setName('remove').setDescription('Elimina un recordatorio.').addIntegerOption(o => o.setName('id').setDescription('ID del recordatorio').setRequired(true))),
        async execute(ctx, subcommand, ...args) {
            const user = ctx.user || ctx.author;
            
            if (!reminders.has(user.id)) reminders.set(user.id, []);
            const userReminders = reminders.get(user.id);

            if (subcommand === 'set') {
                const minutes = typeof args[0] === 'number' ? args[0] : parseInt(args[0]);
                const message = typeof args[0] === 'number' ? args[1] : args.slice(1).join(' ');
                
                if (isNaN(minutes)) return ctx.reply('❌ Minutos inválidos.');

                const id = Date.now() % 10000; // ID simple
                const timeout = setTimeout(() => {
                    user.send(`⏰ **Recordatorio:** ${message}`).catch(() => {});
                    const current = reminders.get(user.id) || [];
                    reminders.set(user.id, current.filter(r => r.id !== id));
                }, minutes * 60000);

                userReminders.push({ id, time: Date.now() + minutes * 60000, message, timeout });
                await ctx.reply(`⏰ Recordatorio #${id} establecido para dentro de ${minutes} minutos.`);
            } 
            else if (subcommand === 'list') {
                if (userReminders.length === 0) return ctx.reply('No tienes recordatorios pendientes.');
                const list = userReminders.map(r => `**#${r.id}** - <t:${Math.floor(r.time/1000)}:R>: ${r.message}`).join('\n');
                await ctx.reply({ embeds: [new EmbedBuilder().setTitle('Recordatorios').setDescription(list).setColor('Random')] });
            } 
            else if (subcommand === 'remove') {
                const id = parseInt(args[0]);
                const index = userReminders.findIndex(r => r.id === id);
                if (index === -1) return ctx.reply('❌ Recordatorio no encontrado.');
                
                clearTimeout(userReminders[index].timeout);
                userReminders.splice(index, 1);
                await ctx.reply(`✅ Recordatorio #${id} eliminado.`);
            }
        }
    },
    { 
        name: 'search', 
        description: 'Busca en diferentes plataformas.',
        builder: b => b
            .addSubcommand(s => s.setName('google').setDescription('Búsqueda Google').addStringOption(o => o.setName('consulta').setDescription('Texto').setRequired(true)))
            .addSubcommand(s => s.setName('anime').setDescription('Búsqueda Anime').addStringOption(o => o.setName('consulta').setDescription('Texto').setRequired(true)))
            .addSubcommand(s => s.setName('manga').setDescription('Búsqueda Manga').addStringOption(o => o.setName('consulta').setDescription('Texto').setRequired(true)))
            .addSubcommand(s => s.setName('wiki').setDescription('Búsqueda Wikipedia').addStringOption(o => o.setName('consulta').setDescription('Texto').setRequired(true)))
            .addSubcommand(s => s.setName('lyrics').setDescription('Búsqueda Letras').addStringOption(o => o.setName('consulta').setDescription('Texto').setRequired(true))),
        async execute(ctx, type, query) {
            const q = encodeURIComponent(query);
            let url = '';
            let label = '';

            switch(type) {
                case 'anime': url = `https://myanimelist.net/anime.php?q=${q}`; label = 'MyAnimeList (Anime)'; break;
                case 'manga': url = `https://myanimelist.net/manga.php?q=${q}`; label = 'MyAnimeList (Manga)'; break;
                case 'wiki': url = `https://es.wikipedia.org/w/index.php?search=${q}`; label = 'Wikipedia'; break;
                case 'lyrics': url = `https://genius.com/search?q=${q}`; label = 'Genius'; break;
                default: url = `https://www.google.com/search?q=${q}`; label = 'Google'; break;
            }
            
            await ctx.reply(`🔎 **${label}**: ${url}`);
        }
    },
    { 
        name: 'suggest', 
        description: 'Envía una sugerencia.',
        builder: b => b.addStringOption(o => o.setName('sugerencia').setDescription('Tu sugerencia').setRequired(true)),
        async execute(ctx, suggestion) {
            const channel = ctx.guild.channels.cache.find(c => c.name.includes('sugerencias'));
            if (!channel) return ctx.reply('❌ No encontré un canal de sugerencias.');
            
            const embed = new EmbedBuilder().setTitle('💡 Nueva Sugerencia').setDescription(suggestion).setAuthor({ name: (ctx.user || ctx.author).tag });
            await channel.send({ embeds: [embed] });
            await ctx.reply({ content: '✅ Sugerencia enviada.', flags: MessageFlags.Ephemeral });
        }
    },
    { 
        name: 'translate', 
        description: 'Enlace a Google Translate.',
        builder: b => b.addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true)),
        async execute(ctx, text) {
            const url = `https://translate.google.com/?sl=auto&tl=es&text=${encodeURIComponent(text)}&op=translate`;
            await ctx.reply(`🌐 Traductor: ${url}`);
        }
    },
    { 
        name: 'download', 
        description: 'Descarga contenido (simulado).',
        builder: b => b.addStringOption(o => o.setName('url').setDescription('URL').setRequired(true)),
        async execute(ctx, url) {
            await ctx.reply(`📥 Para descargar contenido de ${url}, por favor usa un servicio externo o revisa si el enlace es directo.`);
        }
    },
];

module.exports = commands.map(cmdInfo => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdInfo.name)
            .setDescription(cmdInfo.description)
            ,
        category: 'utility',
        description: cmdInfo.description,
        usage: `!!${cmdInfo.name}`,
        aliases: [],
        
        async execute(message, args) {
            if (cmdInfo.name === 'embed') return cmdInfo.execute(message, args[0], args.slice(1).join(' '));
            if (cmdInfo.name === 'inviteinfo') return cmdInfo.execute(message, args[0]);
            
            if (cmdInfo.name === 'reminder') {
                // !!reminder set 10 msg | !!reminder list | !!reminder remove 123
                const sub = args[0];
                if (!['set', 'list', 'remove'].includes(sub)) return message.reply('Uso: `!!reminder <set|list|remove> ...`');
                return cmdInfo.execute(message, sub, ...args.slice(1));
            }
            
            if (cmdInfo.name === 'search') {
                // !!search anime query | !!search query
                const sub = args[0];
                const validSubs = ['google', 'anime', 'manga', 'wiki', 'lyrics'];
                if (validSubs.includes(sub)) {
                    return cmdInfo.execute(message, sub, args.slice(1).join(' '));
                }
                return cmdInfo.execute(message, 'google', args.join(' '));
            }

            if (cmdInfo.name === 'suggest') return cmdInfo.execute(message, args.join(' '));
            if (cmdInfo.name === 'translate') return cmdInfo.execute(message, args.join(' '));
            if (cmdInfo.name === 'download') return cmdInfo.execute(message, args[0]);
            
            return cmdInfo.execute(message);
        },

        async executeSlash(interaction) {
            if (cmdInfo.name === 'embed') return cmdInfo.execute(interaction, interaction.options.getString('titulo'), interaction.options.getString('descripcion'));
            if (cmdInfo.name === 'inviteinfo') return cmdInfo.execute(interaction, interaction.options.getString('codigo'));
            
            if (cmdInfo.name === 'reminder') {
                const sub = interaction.options.getSubcommand();
                if (sub === 'set') return cmdInfo.execute(interaction, sub, interaction.options.getInteger('minutos'), interaction.options.getString('mensaje'));
                if (sub === 'remove') return cmdInfo.execute(interaction, sub, interaction.options.getInteger('id'));
                return cmdInfo.execute(interaction, sub);
            }

            if (cmdInfo.name === 'search') {
                const sub = interaction.options.getSubcommand();
                return cmdInfo.execute(interaction, sub, interaction.options.getString('consulta'));
            }

            if (cmdInfo.name === 'suggest') return cmdInfo.execute(interaction, interaction.options.getString('sugerencia'));
            if (cmdInfo.name === 'translate') return cmdInfo.execute(interaction, interaction.options.getString('texto'));
            if (cmdInfo.name === 'download') return cmdInfo.execute(interaction, interaction.options.getString('url'));

            return cmdInfo.execute(interaction);
        }
    };

    if (cmdInfo.builder) cmdInfo.builder(command.data);

    return command;
});