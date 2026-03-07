const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getPartnerId, createMarriage, endMarriage, createProposal, getProposal, deleteProposal, getOutgoingProposal } = require('../marriageManager.js');

const ICONS = {
    ring: '💍',
    heart: '❤️',
    broken_heart: '💔',
    profile: '👤',
    error: '❌',
    success: '✅'
};

const COLORS = {
    primary: '#FF69B4', // Hot Pink
    error: '#FF6961',   // Pastel Red
    success: '#A7D7C5', // Mint Green
    info: '#C8A2C8'     // Lilac
};

const commands = [
    // MARRY
    {
        name: 'marry',
        description: 'Propónle matrimonio a otro usuario.',
        usage: '!!marry <@usuario>',
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('La persona a la que quieres proponerle matrimonio.').setRequired(true)),
        async execute(ctx, targetUser) {
            const proposer = ctx.user || ctx.author;
            const guildId = ctx.guild.id;

            if (targetUser.bot) return ctx.reply({ content: `${ICONS.error} No puedes casarte con un bot, ¡por mucho que lo quieras!`, flags: MessageFlags.Ephemeral });
            if (targetUser.id === proposer.id) return ctx.reply({ content: `${ICONS.error} No puedes casarte contigo mismo...`, flags: MessageFlags.Ephemeral });

            if (getPartnerId(guildId, proposer.id)) return ctx.reply({ content: `${ICONS.error} Ya estás casado/a. Debes divorciarte primero.`, flags: MessageFlags.Ephemeral });
            if (getPartnerId(guildId, targetUser.id)) return ctx.reply({ content: `${ICONS.error} **${targetUser.username}** ya está casado/a.`, flags: MessageFlags.Ephemeral });

            if (getProposal(targetUser.id)) return ctx.reply({ content: `${ICONS.error} **${targetUser.username}** ya tiene una propuesta pendiente.`, flags: MessageFlags.Ephemeral });
            if (getProposal(proposer.id)) return ctx.reply({ content: `${ICONS.error} Tienes una propuesta pendiente por responder.`, flags: MessageFlags.Ephemeral });

            const outgoing = getOutgoingProposal(proposer.id);
            if (outgoing) {
                if (outgoing === targetUser.id) return ctx.reply({ content: `${ICONS.error} Ya le has enviado una propuesta a **${targetUser.username}**. Espera su respuesta.`, flags: MessageFlags.Ephemeral });
                return ctx.reply({ content: `${ICONS.error} Ya tienes una propuesta enviada a otra persona.`, flags: MessageFlags.Ephemeral });
            }

            const targetOutgoing = getOutgoingProposal(targetUser.id);
            if (targetOutgoing) return ctx.reply({ content: `${ICONS.error} **${targetUser.username}** tiene una propuesta pendiente enviada a otra persona.`, flags: MessageFlags.Ephemeral });

            createProposal(proposer.id, targetUser.id);

            // Crear botones para aceptar/rechazar
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('accept_marriage')
                        .setLabel('Aceptar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji(ICONS.ring),
                    new ButtonBuilder()
                        .setCustomId('reject_marriage')
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji(ICONS.error)
                );

            const proposerMember = await ctx.guild.members.fetch(proposer.id);
            const targetMember = await ctx.guild.members.fetch(targetUser.id);

            const embed = new EmbedBuilder()
                .setColor(COLORS.primary)
                .setTitle(`${ICONS.ring} ¡Propuesta de Matrimonio!`)
                .setDescription(`**${proposerMember.displayName}** le ha propuesto matrimonio a **${targetMember.displayName}**.\n\n${targetUser}, ¿aceptas casarte con esta persona?`);
            
            const response = await ctx.reply({ content: `${targetUser}`, embeds: [embed], components: [row] });
            
            // Crear colector para los botones
            const message = ctx.isChatInputCommand?.() ? await ctx.fetchReply() : response;
            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000 }); // 5 minutos

            collector.on('collect', async i => {
                if (i.user.id !== targetUser.id) {
                    return i.reply({ content: `${ICONS.error} No puedes responder a esta propuesta, no es para ti.`, flags: MessageFlags.Ephemeral });
                }

                if (i.customId === 'accept_marriage') {
                    if (getPartnerId(guildId, proposer.id) || getPartnerId(guildId, targetUser.id)) {
                        deleteProposal(targetUser.id);
                        return i.reply({ content: `${ICONS.error} El matrimonio no puede proceder porque uno de los usuarios ya está casado.`, flags: MessageFlags.Ephemeral });
                    }

                    createMarriage(guildId, proposer.id, targetUser.id);
                    deleteProposal(targetUser.id);

                    const successEmbed = new EmbedBuilder()
                        .setColor(COLORS.success)
                        .setTitle(`${ICONS.heart} ¡Felicidades!`)
                        .setDescription(`**${proposerMember.displayName}** y **${targetMember.displayName}** ahora están felizmente casados.`)
                        .setImage('https://i.imgur.com/dcn6h2s.gif'); // Gif de boda anime

                    await i.update({ content: null, embeds: [successEmbed], components: [] });
                    collector.stop();
                } else if (i.customId === 'reject_marriage') {
                    deleteProposal(targetUser.id);
                    
                    const rejectEmbed = new EmbedBuilder()
                        .setColor(COLORS.error)
                        .setTitle(`${ICONS.broken_heart} Propuesta Rechazada`)
                        .setDescription(`**${targetMember.displayName}** ha rechazado la propuesta de **${proposerMember.displayName}**.`);

                    await i.update({ content: null, embeds: [rejectEmbed], components: [] });
                    collector.stop();
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
                    );
                    if (message.editable) message.edit({ content: 'La propuesta ha expirado.', components: [disabledRow] }).catch(() => {});
                    deleteProposal(targetUser.id);
                }
            });
        }
    },
    // ACCEPT
    {
        name: 'accept',
        description: 'Acepta una propuesta de matrimonio.',
        usage: '!!accept',
        async execute(ctx) {
            const target = ctx.user || ctx.author;
            const guildId = ctx.guild.id;
            const proposerId = getProposal(target.id);

            if (!proposerId) return ctx.reply({ content: `${ICONS.error} No tienes ninguna propuesta de matrimonio pendiente.`, flags: MessageFlags.Ephemeral });

            const proposer = await ctx.client.users.fetch(proposerId);
            
            if (getPartnerId(guildId, proposer.id) || getPartnerId(guildId, target.id)) {
                return ctx.reply({ content: `${ICONS.error} No se puede completar el matrimonio porque uno de los dos ya está casado.`, flags: MessageFlags.Ephemeral });
            }
            
            createMarriage(guildId, proposer.id, target.id);
            deleteProposal(target.id);

            const proposerMember = await ctx.guild.members.fetch(proposer.id);
            const targetMember = await ctx.guild.members.fetch(target.id);

            const embed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle(`${ICONS.heart} ¡Felicidades!`)
                .setDescription(`**${proposerMember.displayName}** y **${targetMember.displayName}** ahora están felizmente casados.`)
                .setImage('https://i.imgur.com/dcn6h2s.gif');

            await ctx.reply({ content: `${proposer} ${target}`, embeds: [embed] });
        }
    },
    // REJECT
    {
        name: 'reject',
        description: 'Rechaza una propuesta de matrimonio.',
        usage: '!!reject',
        async execute(ctx) {
            const target = ctx.user || ctx.author;
            const proposerId = getProposal(target.id);

            if (!proposerId) return ctx.reply({ content: `${ICONS.error} No tienes ninguna propuesta de matrimonio pendiente.`, flags: MessageFlags.Ephemeral });
            
            const proposer = await ctx.client.users.fetch(proposerId);
            deleteProposal(target.id);

            const targetMember = await ctx.guild.members.fetch(target.id);
            const proposerMember = await ctx.guild.members.fetch(proposer.id);

            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${ICONS.broken_heart} Propuesta Rechazada`)
                .setDescription(`**${targetMember.displayName}** ha rechazado la propuesta de **${proposerMember.displayName}**.`);

            await ctx.reply({ content: `${proposer}`, embeds: [embed] });
        }
    },
    // DIVORCE
    {
        name: 'divorce',
        description: 'Termina tu matrimonio actual.',
        usage: '!!divorce',
        async execute(ctx) {
            const user = ctx.user || ctx.author;
            const guildId = ctx.guild.id;
            const partnerId = getPartnerId(guildId, user.id);

            if (!partnerId) return ctx.reply({ content: `${ICONS.error} No estás casado/a.`, flags: MessageFlags.Ephemeral });

            const partner = await ctx.client.users.fetch(partnerId);
            endMarriage(guildId, user.id);

            const userMember = await ctx.guild.members.fetch(user.id);
            const partnerMember = await ctx.guild.members.fetch(partner.id);

            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${ICONS.broken_heart} Matrimonio Terminado`)
                .setDescription(`**${userMember.displayName}** y **${partnerMember.displayName}** se han divorciado.`);

            await ctx.reply({ embeds: [embed] });
        }
    },
    // PROFILE
    {
        name: 'marriage',
        aliases: ['marryprofile'],
        description: 'Muestra tu estado civil o el de otro usuario.',
        usage: '!!marriage [@usuario]',
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.')),
        async execute(ctx, targetUser) {
            const user = targetUser || (ctx.user || ctx.author);
            const guildId = ctx.guild.id;
            const partnerId = getPartnerId(guildId, user.id);

            const userMember = await ctx.guild.members.fetch(user.id);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Perfil de ${userMember.displayName}`, iconURL: user.displayAvatarURL() });

            if (partnerId) {
                const partner = await ctx.client.users.fetch(partnerId);
                const partnerMember = await ctx.guild.members.fetch(partner.id);
                embed.setColor(COLORS.primary)
                     .setTitle(`${ICONS.heart} Felizmente Casado/a`)
                     .setDescription(`**${userMember.displayName}** está casado/a con **${partnerMember.displayName}**.`);
            } else {
                embed.setColor(COLORS.info)
                     .setTitle(`${ICONS.profile} Soltero/a`)
                     .setDescription(`**${userMember.displayName}** está buscando el amor.`);
            }
            
            await ctx.reply({ embeds: [embed] });
        }
    }
];

module.exports = commands.map(cmdConfig => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdConfig.name)
            .setDescription(cmdConfig.description),
        category: 'marriage',
        description: cmdConfig.description,
        usage: cmdConfig.usage,
        aliases: cmdConfig.aliases || [],
        
        async execute(message, args) {
            if (cmdConfig.name === 'marry') {
                const target = message.mentions.users.first();
                if (!target) return message.reply({ content: `${ICONS.error} Debes mencionar a un usuario para proponerle matrimonio.` });
                return cmdConfig.execute(message, target);
            }
            if (cmdConfig.name === 'marriage') {
                const target = message.mentions.users.first();
                return cmdConfig.execute(message, target);
            }
            return cmdConfig.execute(message);
        },

        async executeSlash(interaction) {
            if (cmdConfig.name === 'marry' || cmdConfig.name === 'marriage') {
                const target = interaction.options.getUser('usuario');
                return cmdConfig.execute(interaction, target);
            }
            return cmdConfig.execute(interaction);
        }
    };
    if (cmdConfig.builder) {
        cmdConfig.builder(command.data);
    }
    return command;
});