const { SlashCommandBuilder, EmbedBuilder, version, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os');

// --- 📋 LISTA DE COMANDOS ---
const commands = [
    {
        name: 'bot-info',
        description: 'Muestra información y estadísticas sobre el bot.',
        async execute(ctx) {
            const client = ctx.client;
            const embed = new EmbedBuilder()
                .setTitle('ℹ️ Información del Bot')
                .setColor('#AEC6CF')
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Usuarios', value: `${client.users.cache.size}`, inline: true },
                    { name: 'Canales', value: `${client.channels.cache.size}`, inline: true },
                    { name: 'Discord.js', value: `v${version}`, inline: true },
                    { name: 'Node.js', value: process.version, inline: true },
                    { name: 'Plataforma', value: `${os.type()} ${os.release()}`, inline: true },
                    { name: 'Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                )
                .setTimestamp();
            
            if (ctx.reply) await ctx.reply({ embeds: [embed] });
            else await ctx.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'invite',
        description: 'Obtén el enlace para invitar al bot a tu servidor.',
        async execute(ctx) {
            const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${ctx.client.user.id}&permissions=8&scope=bot%20applications.commands`;
            const embed = new EmbedBuilder()
                .setTitle('🔗 Invítame')
                .setDescription('¡Haz que Rockstar se una a tu comunidad!')
                .setColor('#77DD77');
            
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Invitar Bot').setURL(inviteUrl).setStyle(ButtonStyle.Link)
            );

            if (ctx.reply) await ctx.reply({ embeds: [embed], components: [row] });
            else await ctx.channel.send({ embeds: [embed], components: [row] });
        }
    },
    {
        name: 'support',
        description: 'Obtén el enlace al servidor de soporte.',
        async execute(ctx) {
            const supportUrl = 'https://discord.gg/tu-servidor'; // ⚠️ CAMBIA ESTO
            const embed = new EmbedBuilder()
                .setTitle('🤝 Soporte')
                .setDescription('¿Necesitas ayuda? Únete a nuestro servidor oficial.')
                .setColor('#F7DBA7');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Servidor de Soporte').setURL(supportUrl).setStyle(ButtonStyle.Link)
            );
            
            if (ctx.reply) await ctx.reply({ embeds: [embed], components: [row] });
            else await ctx.channel.send({ embeds: [embed], components: [row] });
        }
    },
    {
        name: 'dashboard',
        description: 'Enlace al panel de control del bot.',
        async execute(ctx) {
            const embed = new EmbedBuilder()
                .setTitle('🎛️ Dashboard Rockstar')
                .setDescription('✨ **¡Próximamente!**\nEstamos trabajando en una web para configurar el bot.\n\n🌸 **Acceso Anticipado:** [Click Aquí](https://rockstar-e5ss.onrender.com)')
                .setColor('#5865F2');
            
            if (ctx.reply) await ctx.reply({ embeds: [embed] });
            else await ctx.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'donate',
        description: 'Apoya el desarrollo del bot.',
        async execute(ctx) {
            const msg = '💖 Puedes apoyarnos en: https://ko-fi.com/rockstarbot';
            if (ctx.reply) await ctx.reply(msg);
            else await ctx.channel.send(msg);
        }
    }
];

// --- 👤 COMANDO USER (CON SUBCOMANDOS) ---
const userCommand = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Información sobre un usuario.')
        .addSubcommand(sub => sub.setName('info').setDescription('Ver info general.').addUserOption(o => o.setName('usuario').setDescription('El usuario.')))
        .addSubcommand(sub => sub.setName('avatar').setDescription('Ver avatar.').addUserOption(o => o.setName('usuario').setDescription('El usuario.')))
        .addSubcommand(sub => sub.setName('banner').setDescription('Ver banner.').addUserOption(o => o.setName('usuario').setDescription('El usuario.'))),
    category: 'info',
    async execute(message, args) {
        await message.reply('Usa `/user info`, `/user avatar` o `/user banner` para este comando.');
    },
    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario') || interaction.user;

        if (sub === 'info') {
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            const embed = new EmbedBuilder()
                .setTitle(`👤 Info de ${target.username}`)
                .setThumbnail(target.displayAvatarURL())
                .setColor('#C8A2C8')
                .addFields(
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Bot', value: target.bot ? 'Sí' : 'No', inline: true },
                    { name: 'Creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
                );
            if (member) embed.addFields({ name: 'Unión', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true });
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'avatar') {
            const embed = new EmbedBuilder().setTitle(`Avatar de ${target.username}`).setImage(target.displayAvatarURL({ size: 512 })).setColor('#AEC6CF');
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'banner') {
            const user = await target.fetch(true);
            if (!user.bannerURL()) return interaction.reply({ content: 'No tiene banner.', ephemeral: true });
            const embed = new EmbedBuilder().setTitle(`Banner de ${target.username}`).setImage(user.bannerURL({ size: 512 })).setColor('#AEC6CF');
            return interaction.reply({ embeds: [embed] });
        }
    }
};

// --- 📦 EXPORTACIÓN ---
module.exports = [
    ...commands.map(cmd => ({
        data: new SlashCommandBuilder().setName(cmd.name).setDescription(cmd.description),
        name: cmd.name,
        description: cmd.description,
        category: 'info',
        async execute(message, args) { return cmd.execute(message); },
        async executeSlash(interaction) { return cmd.execute(interaction); }
    })),
    userCommand
];