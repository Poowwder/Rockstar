const { 
    EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    ComponentType, SlashCommandBuilder 
} = require('discord.js');

module.exports = {
    name: 'help',
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('🎀 Muestra el menú de ayuda del bot'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;

        const categories = {};
        client.commands.forEach(cmd => {
            const cat = cmd.category ? cmd.category.toLowerCase() : 'utilidades';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(`\`!!${cmd.name}\``);
        });

        const emojis = { información: 'ℹ️', harem: '💍', economía: '💰', utilidades: '🛠️', diversión: '🎈' };

        const mainEmbed = new EmbedBuilder()
            .setTitle('🌸 ‧₊˚ Menú de Ayuda Rockstar ˚₊‧ 🌸')
            .setColor('#FFB6C1')
            .setDescription(`*“Selecciona una categoría para ver mis comandos.”* ✨\n\n** ୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧ **`);

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_select')
                .setPlaceholder('🌷 Elige una categoría...')
                .addOptions(Object.keys(categories).map(cat => ({
                    label: cat.charAt(0).toUpperCase() + cat.slice(1),
                    value: cat,
                    emoji: emojis[cat] || '✨'
                })))
        );

        const response = await input.reply({ embeds: [mainEmbed], components: [menu] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: '❌ No es tu menú.', ephemeral: true });
            const selected = i.values[0];
            const embed = new EmbedBuilder()
                .setTitle(`${emojis[selected] || '✨'} ‧₊˚ Categoría: ${selected.toUpperCase()}`)
                .setColor('#CDB4DB')
                .setDescription(`╰┈➤ ${categories[selected].join(' ‧ ')}`);
            await i.update({ embeds: [embed] });
        });
    }
};