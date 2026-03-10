const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType 
} = require('discord.js');
const { getUserData, updateUserData, addXP } = require('../userManager.js');

module.exports = {
    name: 'craft',
    description: 'Taller de forja y restauración aesthetic.',
    category: 'economia',
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('🛠️ Fabrica o repara herramientas mágicas'),

    async execute(input) {
        const isSlash = input.type !== undefined;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const userId = user.id;

        const getRndEmoji = () => {
            const emojis = guild.emojis.cache.filter(e => e.available);
            return emojis.size > 0 ? emojis.random().toString() : '✨';
        };

        const recipes = {
            picos: [
                { id: 'pico_madera', name: 'Púa de Corteza', mats: { madera: 5 }, dur: 15, premium: false },
                { id: 'pico_piedra', name: 'Triturador de Granito', mats: { piedra: 10 }, dur: 45, premium: false },
                { id: 'pico_hierro', name: 'Rompealmas de Acero', mats: { hierro: 8 }, dur: 120, premium: false },
                { id: 'pico_diamante', name: 'Perforador Celestial', mats: { diamante: 5 }, dur: 350, premium: false },
                { id: 'pico_mitico', name: 'Eclipse Eterno', mats: { diamante: 10, mitico: 1 }, dur: 2000, premium: true }
            ],
            canas: [
                { id: 'cana_basica', name: 'Hilo de Seda', mats: { madera: 3, hilo: 2 }, dur: 10, premium: false },
                { id: 'cana_reforzada', name: 'Garra de Río', mats: { madera: 5, hierro: 2 }, dur: 35, premium: false },
                { id: 'cana_profesional', name: 'Señuelo Abisal', mats: { hierro: 5, diamante: 1 }, dur: 100, premium: false },
                { id: 'cana_legendaria', name: 'Atrapasueños Marino', mats: { diamante: 5, perla: 2 }, dur: 300, premium: false },
                { id: 'cana_divina', name: 'Lágrima de Neptuno', mats: { diamante: 10, esencia: 1 }, dur: 1500, premium: true }
            ]
        };

        let data = await getUserData(userId);
        
        let failChance = 0.20; 
        if (data.premiumType === 'pro') failChance = 0.10; 
        if (data.premiumType === 'ultra') failChance = 0.15; 

        let currentCategory = 'home';

        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Alquimia`, iconURL: user.displayAvatarURL() });

            const rows = [];
            const rowNav = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Taller Rockstar ˚₊ ⟣ ${getRndEmoji()}`)
                    .setDescription(`> *“Lo que se rompe puede sanar, pero lo que se descuida se pierde...”*\n\nBienvenida la persona artesana. ¿Qué deseas hacer hoy?`);

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('cat_picos').setLabel('PICOS').setStyle(ButtonStyle.Secondary).setEmoji('⚒️'),
                    new ButtonBuilder().setCustomId('cat_canas').setLabel('CAÑAS').setStyle(ButtonStyle.Secondary).setEmoji('🎣'),
                    new ButtonBuilder().setCustomId('cat_repair').setLabel('REPARAR').setStyle(ButtonStyle.Secondary).setEmoji('🛠️'),
                    new ButtonBuilder().setCustomId('close').setLabel('CERRAR').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowNav);
            } 
            else if (currentCategory === 'repair') {
                const brokenItems = Object.entries(data.inventory || {}).filter(([id, qty]) => id.endsWith('_broken') && qty > 0);
                embed.setTitle(`${getRndEmoji()} ⊹ Restauración ⊹ ${getRndEmoji()}`)
                    .setDescription(brokenItems.length > 0 ? brokenItems.map(([id]) => `╰┈➤ **${id.replace('_broken', '').toUpperCase()}**\n 🎀 *Costo:* 50% materiales.`).join('\n\n') : "🥀 *No hay herramientas rotas en tu inventario.*");

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowNav);

                if (brokenItems.length > 0) {
                    const select = new StringSelectMenuBuilder().setCustomId('do_repair').setPlaceholder('Selecciona un objeto roto...');
                    brokenItems.forEach(([id]) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(id.replace('_broken', '').toUpperCase()).setValue(id)));
                    rows.push(new ActionRowBuilder().addComponents(select));
                }
            }
            else {
                const pool = recipes[currentCategory].filter(i => !i.premium || (data.premiumType !== 'none' && data.premiumType !== undefined));
                embed.setTitle(`${getRndEmoji()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`)
                    .setDescription(pool.map(i => `**${i.name}**\n╰ Dur: \`${i.dur}\` ⊹ Fallo: \`${(failChance * 100).toFixed(0)}%\``).join('\n\n'));

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowNav);

                const select = new StringSelectMenuBuilder().setCustomId('do_craft').setPlaceholder('Forjar herramienta...');
                pool.forEach(i => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(i.name).setValue(i.id)));
                rows.push(new ActionRowBuilder().addComponents(select));
            }
            return { embeds: [embed], components: rows };
        };

        const response = isSlash ? await input.reply({ ...generarInterfaz(), fetchReply: true }) : await input.reply(generarInterfaz());
        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: '⟢ Estas sombras no te pertenecen.', ephemeral: true });

            if (i.customId === 'close') { await i.message.delete().catch(() => null); return collector.stop(); }
            if (i.customId === 'go_home') currentCategory = 'home';
            else if (i.customId.startsWith('cat_')) currentCategory = i.customId.replace('cat_', '');

            if (i.customId === 'do_repair') {
                const brokenId = i.values[0];
                const originalId = brokenId.replace('_broken', '');
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === originalId);

                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    const cost = Math.ceil(cant / 2);
                    if ((data.inventory[mat] || 0) < cost) return i.reply({ content: `🕸️ Te faltan materiales (${cost}x ${mat}).`, ephemeral: true });
                    data.inventory[mat] -= cost;
                }

                data.inventory[brokenId] -= 1;
                data.inventory[`${originalId}_repaired`] = (data.inventory[`${originalId}_repaired`] || 0) + 1;
                await updateUserData(userId, { inventory: data.inventory });
                await i.reply({ content: `✨ **${recipe.name}** restaurado. ¡Es su última vida! ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            if (i.customId === 'do_craft') {
                const recipeId = i.values[0];
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === recipeId);

                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    if ((data.inventory[mat] || 0) < cant) return i.reply({ content: `🕸️ No tienes materiales suficientes.`, ephemeral: true });
                    data.inventory[mat] -= cant;
                }

                if (Math.random() < failChance) {
                    await updateUserData(userId, { inventory: data.inventory });
                    return i.reply({ content: `💥 La forja falló. Los materiales se han perdido. 🥀`, ephemeral: true });
                }

                data.inventory[recipe.id] = (data.inventory[recipe.id] || 0) + 1;
                await updateUserData(userId, { inventory: data.inventory });
                await addXP(userId, 150, i.client);
                await i.reply({ content: `✨ **${recipe.name}** forjado con éxito. ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            await i.update(generarInterfaz());
        });
    }
};
