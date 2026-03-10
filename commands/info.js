const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

// --- 📋 LISTA DE COMANDOS SIMPLES ---
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
            
            // Verificamos si es interacción o mensaje para responder correctamente
            if (ctx.reply) await ctx.reply({ embeds: [embed] });
            else await ctx.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'invite',
        description: 'Obtén el enlace para invitar al bot a tu servidor.',
        async execute(ctx) {
            const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${ctx.client.user.id}&scope=bot%20applications.commands&permissions=8`;
            const embed = new EmbedBuilder()
                .setTitle('🔗 Invítame')
                .setDescription(`Puedes invitarme a tu servidor usando [este enlace](${inviteUrl}).`)
                .setColor('#77DD77');
            
            if (ctx.reply) await ctx.reply({ embeds: [embed] });
            else await ctx.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'support',
        description: 'Obtén el enlace al servidor de soporte.',
        async execute(ctx) {
            const supportUrl = 'https://discord.gg/tu-servidor'; // Reemplaza esto
            const embed = new EmbedBuilder()
                .setTitle('🤝 Soporte')
                .setDescription(`¿Necesitas ayuda? Únete a nuestro [servidor de soporte](${supportUrl}).`)
                .setColor('#F7DBA7');
            
            if (ctx.reply) await ctx.reply({ embeds: [embed] });
            else await ctx.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'dashboard',
        description: 'Enlace al panel de control del bot.',
        async execute(ctx) {
            const embed = new EmbedBuilder()
                .setTitle('🎛️ Dashboard')
                .setDescription('Gestiona el bot desde nuestra web: [Click Aquí](https://tu-web.com)')
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

// --- 👤 COMANDO DE USUARIO (CON SUBCOMANDOS) ---
const userCommand = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Muestra información sobre un usuario.')
        .addSubcommand(sub => sub.setName('info').setDescription('Muestra información general.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario.')))
        .addSubcommand(sub => sub.setName('avatar').setDescription('Muestra el avatar.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario.')))
        .addSubcommand(sub => sub.setName('banner').setDescription('Muestra el banner.').addUserOption(opt => opt.setName('usuario').setDescription('El usuario.'))),
    category: 'info',
    async execute(message, args) {
        await message.reply('Este comando solo está disponible con `/user [info/avatar/banner]`.');
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
                    { name: 'Cuenta Creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                );
            if (member) {
                embed.addFields(
                    { name: 'Se unió', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
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

// --- 📦 EXPORTACIÓN ---
module.exports = [
    ...commands.map(cmdConfig => ({
        data: new SlashCommandBuilder().setName(cmdConfig.name).setDescription(cmdConfig.description),
        category: 'info', // Esto asegura que tu help.js lo detecte automáticamente
        name: cmdConfig.name,
        description: cmdConfig.description,
        async execute(message, args) { return cmdConfig.execute(message); },
        async executeSlash(interaction) { return cmdConfig.execute(interaction); }
    })),
    userCommand
];