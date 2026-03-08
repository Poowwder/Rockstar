const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    name: 'help',
    category: 'información',
    async execute(message) {
        const commands = message.client.commands;
        const categories = {};
        
        commands.forEach(cmd => {
            const cat = cmd.category ? cmd.category.toLowerCase() : 'utilidades';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(`\`!!${cmd.name}\``);
        });

        const emojis = { moderación: '🛡️', información: 'ℹ️', configuración: '⚙️', diversión: '🎈', economía: '💰', utilidades: '🛠️', matrimonios: '💍' };

        const mainEmbed = new EmbedBuilder()
            .setTitle('🌸 Menú de Ayuda')
            .setDescription('Selecciona una categoría para ver mis comandos.')
            .setColor('#FFB6C1');

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('Elige una categoría...')
                .addOptions(Object.keys(categories).map(cat => ({
                    label: cat.charAt(0).toUpperCase() + cat.slice(1),
                    value: cat,
                    emoji: emojis[cat] || '✨'
                })))
        );

        const response = await message.reply({ embeds: [mainEmbed], components: [menu] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: 'No es tu menú.', ephemeral: true });
            const selected = i.values[0];
            const embed = new EmbedBuilder()
                .setTitle(`${emojis[selected] || '✨'} ${selected.toUpperCase()}`)
                .setDescription(categories[selected].join(', '))
                .setColor('#FFB6C1');
            await i.update({ embeds: [embed] });
        });
    }
};