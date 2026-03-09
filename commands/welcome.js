const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); // Usamos tu DB central
// Asumo que este archivo existe para generar el embed, si no, puedes hacerlo manual
const { createWelcomeFarewellEmbed } = require('../events/embedBuilder.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Sistema de bienvenida')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('configurar')
                .setDescription('Configura las opciones de bienvenida')
                .addChannelOption(opt => opt.setName('canal').setDescription('Canal de bienvenidas').addChannelTypes(ChannelType.GuildText))
                .addRoleOption(opt => opt.setName('rol-usuario').setDescription('Rol para nuevos usuarios'))
                .addStringOption(opt => opt.setName('titulo').setDescription('Título del embed (o "none")'))
                .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción del embed (o "none")'))
                .addStringOption(opt => opt.setName('imagen').setDescription('URL de la imagen'))
                .addStringOption(opt => opt.setName('color').setDescription('Color Hex (ej: #FF5733)'))
        )
        .addSubcommand(sub => sub.setName('preview').setDescription('Vista previa del embed'))
        .addSubcommand(sub => sub.setName('test').setDescription('Envía una prueba al canal')),

    async execute(interaction) {
        // Verificar permisos (funciona para interaction y message gracias al adaptador)
        const member = interaction.member;
        if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply("❌ No tienes permisos para configurar bienvenidas.");
        }

        const guildId = interaction.guild.id;
        const serverData = await getUserData(guildId); // Sacamos la config de la DB
        const config = serverData.welcomeConfig || {};
        
        // El adaptador del index define getSubcommand() para Prefix también
        const sub = interaction.options.getSubcommand();

        // LÓGICA: PREVIEW Y TEST
        if (sub === 'preview' || sub === 'test') {
            if (!config.channelId) return interaction.reply('❌ No hay canal configurado. Usa `/welcome configurar canal: #canal`');
            
            // Generar el embed (usando tu builder o uno manual)
            const { embed, content } = createWelcomeFarewellEmbed(member, config);

            if (sub === 'preview') {
                return interaction.reply({ content: content || undefined, embeds: [embed] });
            } else {
                const channel = interaction.guild.channels.cache.get(config.channelId);
                if (!channel) return interaction.reply('❌ El canal configurado ya no existe.');
                await channel.send({ content: content || undefined, embeds: [embed] });
                return interaction.reply(`✅ Prueba enviada a ${channel}`);
            }
        }

        // LÓGICA: CONFIGURAR
        if (sub === 'configurar') {
            const options = interaction.options;
            
            // Extraer valores (funciona para ambos modos gracias al adaptador)
            const newConfig = {
                channelId: options.getChannel('canal')?.id || config.channelId,
                userRoleId: options.getRole('rol-usuario')?.id || config.userRoleId,
                titulo: options.getString('titulo') || config.titulo,
                descripcion: options.getString('descripcion') || config.descripcion,
                imagen: options.getString('imagen') || config.imagen,
                color: options.getString('color') || config.color
            };

            // Limpiar valores "none"
            for (const key in newConfig) {
                if (newConfig[key] === 'none') newConfig[key] = null;
            }

            serverData.welcomeConfig = newConfig;
            await updateUserData(guildId, serverData);

            return interaction.reply('✅ ¡Configuración de bienvenida guardada en la base de datos!');
        }
    }
};