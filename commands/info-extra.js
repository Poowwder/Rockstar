const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

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
                    { name: 'Uso de Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                )
                .setTimestamp();
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'invite',
        description: 'Obtén el enlace para invitar al bot a tu servidor.',
        async execute(ctx) {
            const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${ctx.client.user.id}&scope=bot%20applications.commands&permissions=8`;
            const embed = new EmbedBuilder()
                .setTitle('🔗 Invítame')
                .setDescription(`Puedes invitarme a tu servidor usando este enlace.`)
                .setColor('#77DD77');
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'support',
        description: 'Obtén el enlace al servidor de soporte.',
        async execute(ctx) {
            // Reemplaza con tu enlace de servidor de soporte
            const supportUrl = 'https://discord.gg/tu-servidor';
            const embed = new EmbedBuilder()
                .setTitle('🤝 Soporte')
                .setDescription(`¿Necesitas ayuda? Únete a nuestro servidor de soporte.`)
                .setColor('#F7DBA7');
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'dashboard',
        description: 'Enlace al panel de control del bot.',
        async execute(ctx) {
            const embed = new EmbedBuilder()
                .setTitle('🎛️ Dashboard')
                .setDescription('Gestiona el bot desde nuestra web: Click Aquí')
                .setColor('#5865F2');
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'donate',
        description: 'Apoya el desarrollo del bot.',
        async execute(ctx) {
            await ctx.reply('💖 Puedes apoyarnos en: https://ko-fi.com/rockstarbot');
        }
    }
];

const userCommand = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Muestra información sobre un usuario.')
        .addSubcommand(sub => sub.setName('info').setDescription('Muestra información general del usuario.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.')))
        .addSubcommand(sub => sub.setName('avatar').setDescription('Muestra el avatar de un usuario.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.')))
        .addSubcommand(sub => sub.setName('banner').setDescription('Muestra el banner de un usuario.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.'))),
    category: 'info',
    async execute(message, args) {
        await message.reply('Este comando solo está disponible como comando de barra (`/user ...`).');
    },
    async executeSlash(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (subcommand === 'info') {
            const embed = new EmbedBuilder()
                .setTitle(`👤 Información de ${target.username}`)
                .setColor('#C8A2C8')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Tag', value: target.tag, inline: true },
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Es un Bot?', value: target.bot ? 'Sí' : 'No', inline: true },
                    { name: 'Cuenta Creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                );
            if (member) {
                 embed.addFields(
                    { name: 'Apodo', value: member.nickname || 'Ninguno', inline: true },
                    { name: 'Se unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                 );
            }
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'avatar') {
            const embed = new EmbedBuilder()
                .setTitle(`Avatar de ${target.username}`)
                .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
                .setColor('#AEC6CF');
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'banner') {
            // Es necesario hacer un fetch extra para obtener el banner
            const userWithBanner = await target.fetch(true);
            const bannerUrl = userWithBanner.bannerURL({ dynamic: true, size: 512 });
            if (!bannerUrl) return interaction.reply({ content: 'Este usuario no tiene un banner.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`Banner de ${target.username}`)
                .setImage(bannerUrl)
                .setColor('#AEC6CF');
            return interaction.reply({ embeds: [embed] });
        }
    }
};

module.exports = [
    ...commands.map(cmdConfig => ({
        data: new SlashCommandBuilder().setName(cmdConfig.name).setDescription(cmdConfig.description),
        category: 'info',
        description: cmdConfig.description,
        usage: `!!${cmdConfig.name}`,
        aliases: [],
        async execute(message, args) { return cmdConfig.execute(message, args); },
        async executeSlash(interaction) { return cmdConfig.execute(interaction); }
    })),
    userCommand
];