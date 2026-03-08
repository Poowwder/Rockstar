const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles'),

    async execute(interaction) {
        const { client } = interaction;
        
        // Categorías basadas en tus archivos
        const categories = {
            economy: { name: '🌸 Economía & Minería', commands: ['mine', 'fish', 'daily', 'inventory', 'balance', 'work', 'weekly', 'auction'] },
            interact: { name: '🎭 Interacciones (Action/Reaction)', commands: ['action', 'reaction', 'marriage'] },
            fun: { name: '🎮 Diversión', commands: ['8ball', 'ship', 'roll', 'banana', 'lucky', 'trivia', 'tictactoe', 'hangman'] },
            mod: { name: '🛡️ Moderación', commands: ['ban', 'kick', 'timeout', 'warn', 'purge', 'slowmode'] },
            config: { name: '⚙️ Configuración', commands: ['language-set', 'log-set', 'nick-set', 'role-add', 'premium_status'] }
        };

        const embed = new EmbedBuilder()
            .setTitle('📚 Panel de Ayuda de Rockstar')
            .setColor('#5865F2')
            .setDescription('Selecciona una categoría para ver los detalles de los comandos.')
            .setThumbnail(client.user.displayAvatarURL());

        // Crear el menú de selección
        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('Selecciona una categoría...')
            .addOptions(
                Object.keys(categories).map(key => ({
                    label: categories[key].name,
                    value: key,
                    description: `Comandos de ${categories[key].name}`
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const response = await interaction.reply({ embeds: [embed], components: [row] });

        // Colector para manejar el menú
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Esta no es tu ayuda.', ephemeral: true });

            const category = categories[i.values[0]];
            const categoryEmbed = new EmbedBuilder()
                .setTitle(category.name)
                .setColor('#3498db');

            let commandList = "";

            category.commands.forEach(cmdName => {
                const cmd = client.commands.get(cmdName);
                if (cmd) {
                    // Verificamos si tiene subcomandos
                    const subcommands = cmd.data.options.filter(opt => opt.toJSON().type === 1);
                    
                    if (subcommands.length > 0) {
                        const subs = subcommands.map(s => `\`${s.name}\``).join(', ');
                        commandList += `**/${cmdName}** [${subs}]\n*${cmd.data.description}*\n\n`;
                    } else {
                        commandList += `**/${cmdName}**\n*${cmd.data.description}*\n\n`;
                    }
                }
            });

            categoryEmbed.setDescription(commandList || "Próximamente...");
            await i.update({ embeds: [categoryEmbed] });
        });
    }
};