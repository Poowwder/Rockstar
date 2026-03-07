const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { categoriasTexto } = require('../constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra el menú de ayuda o información sobre un comando específico.')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('El comando sobre el que quieres obtener información.')
                .setRequired(false)
        ),
    category: 'config',
    description: 'Muestra el menú de ayuda o información sobre un comando específico.',
    async execute(message, args) {
        const { commands } = message.client;

        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.reply('No se encontró ese comando.');
            }

            const embed = new EmbedBuilder()
                .setTitle(`Ayuda para: \`${command.data.name}\``)
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .setDescription(command.description || 'Sin descripción.');

            if (command.usage) {
                embed.addFields({ name: 'Uso', value: `\`${command.usage}\`` });
            }

            await message.reply({ embeds: [embed] });
        } else {
            await sendHelp(message);
        }
    },
    async executeSlash(interaction) {
        const { client, options } = interaction;
        const commandName = options.getString('comando');

        if (commandName) {
            const command = client.commands.get(commandName.toLowerCase());

            if (!command) {
                return interaction.reply({ content: 'No se encontró ese comando.', flags: MessageFlags.Ephemeral });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Ayuda para: \`${command.data.name}\``)
                .setColor(Math.floor(Math.random() * 0xFFFFFF))
                .setDescription(command.description || 'Sin descripción.');

            if (command.usage) {
                embed.addFields({ name: 'Uso', value: `\`${command.usage}\`` });
            }

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
            await sendHelp(interaction, true); // Activar modo efímero para el menú
        }
    }
};

async function sendHelp(ctx, ephemeral = false) {
    const commands = ctx.client.commands;

    // Texto de categorías para el embed
    const categoriasEmbed = categoriasTexto.map(cat =>
        `!!help ${cat.key} ∷ ${cat.label}`
    ).join('\n');

    // Embed principal
    const embed = new EmbedBuilder()
        .setTitle('Comandos de R☆ckstar')
        .addFields(
            {
                name: '» Menú Help',
                value: `Tenemos ${categoriasTexto.length} categorías y ${commands.size} comandos para explorar.\nExisten 5 comandos secretos.\n\nLista de comandos: !!help <categoria>\nComando en detalle: !!help <comando>`
            },
            {
                name: '» Categorías',
                value: categoriasEmbed
            }
        )
        .setFooter({ text: ctx.guild ? ctx.guild.name : 'R☆ckstar' })
        .setTimestamp()
        .setColor(Math.floor(Math.random() * 0xFFFFFF));

    // Componentes: Menú de Selección y Botón de Cerrar
    const components = [];

    // 1. Menú de Selección
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('Selecciona una categoría para ver los comandos');

    categoriasTexto.forEach(cat => {
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(cat.label)
                .setValue(cat.key)
                .setDescription(`Muestra los comandos de la categoría ${cat.label}`)
                .setEmoji(cat.emoji)
        );
    });

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);
    components.push(menuRow);

    // 2. Botón de Cerrar (opcional, pero útil)
    const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help-close').setLabel('Cerrar Menú').setStyle(ButtonStyle.Danger)
    );
    components.push(buttonRow);

    if ('reply' in ctx) return ctx.reply({ embeds: [embed], components: components, flags: ephemeral ? MessageFlags.Ephemeral : undefined });
    else return ctx.channel.send({ embeds: [embed], components: components });
}