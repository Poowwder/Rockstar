const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType 
} = require('discord.js');
const { getUserData, updateUserData, addXP } = require('../userManager.js');

module.exports = {
    name: 'craft',
    description: 'Taller de forja y restauración gótica.',
    category: 'economia',
    usage: '!!craft',
    async execute(message, args) {
        const user = message.author;
        const guild = message.guild;
        
        // --- ⟢ Emojis Dinámicos ⟢ ---
        const localEmojis = guild.emojis.cache.filter(e => e.available);
        const getRndEmoji = () => localEmojis.size > 0 ? localEmojis.random().toString() : '';

        // --- ✦ Base de Datos de Herramientas ✦ ---
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

        let data = await getUserData(user.id);
        
        // --- ⚖️ Configuración de Probabilidades ---
        let failChance = 0.20; // 20% Normal
        if (data.premiumType === 'pro') failChance = 0.10; // 10% Pro
        if (data.premiumType === 'ultra') failChance = 0.15; // 15% Ultra

        let currentCategory = 'home';

        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Alquimia de Sombras`, iconURL: user.displayAvatarURL() });

            const rowNav = new ActionRowBuilder();
            const rowMenu = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Taller Rockstar ˚₊ ⟣ ${getRndEmoji()}`.trim())
                    .setDescription(
                        `> *“Lo que se rompe puede sanar, pero lo que se descuida se pierde...”* ⊹\n\n` +
                        `Bienvenida la persona artesana. ¿En qué puedo asistirte?\n\n` +
                        `✦ **Picos / Cañas:** Crea herramientas nuevas.\n` +
                        `✦ **Reparar:** Restaura tus objetos dañados (Una vida extra).`
                    );

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('cat_picos').setLabel('PICOS').setStyle(ButtonStyle.Secondary).setEmoji('⚒️'),
                    new ButtonBuilder().setCustomId('cat_canas').setLabel('CAÑAS').setStyle(ButtonStyle.Secondary).setEmoji('🎣'),
                    new ButtonBuilder().setCustomId('cat_repair').setLabel('REPARAR').setStyle(ButtonStyle.Secondary).setEmoji('🛠️'),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );
            } 
            else if (currentCategory === 'repair') {
                const brokenItems = Object.entries(data.inventory || {})
                    .filter(([id, qty]) => id.endsWith('_broken') && qty > 0);

                embed.setTitle(`${getRndEmoji()} ⊹ Restauración de Alma ⊹ ${getRndEmoji()}`.trim())
                    .setDescription(
                        `*Objetos que aún tienen una esperanza:* ✦\n\n` +
                        (brokenItems.length > 0 
                            ? brokenItems.map(([id]) => `╰┈➤ **${id.replace('_broken', '').toUpperCase()}**\n 🎀 *Costo:* 50% de materiales originales.`).join('\n\n')
                            : "🥀 *No tienes herramientas rotas actualmente.*")
                    );

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );

                if (brokenItems.length > 0) {
                    const select = new StringSelectMenuBuilder().setCustomId('do_repair').setPlaceholder('¿Qué deseas reparar?');
                    brokenItems.forEach(([id]) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(id.replace('_broken', '').toUpperCase()).setValue(id)));
                    rowMenu.addComponents(select);
                }
            }
            else {
                const pool = recipes[currentCategory].filter(i => !i.premium || (data.premiumType !== 'none' && data.premiumType !== undefined));
                
                embed.setTitle(`${getRndEmoji()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`.trim())
                    .setDescription(
                        `*Detalles de forja para esta sección:* ✦\n\n` +
                        pool.map(i => `**${i.name}**\n╰ Durabilidad: \`${i.dur} usos\` ⊹ \`${(failChance * 100).toFixed(0)}% fallo\``).join('\n\n')
                    );

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Volver').setStyle(ButtonStyle.Secondary).setEmoji('🏠'),
                    new ButtonBuilder().setCustomId('close').setLabel('Cerrar').setStyle(ButtonStyle.Danger)
                );

                const select = new StringSelectMenuBuilder().setCustomId('do_craft').setPlaceholder('Forjar herramienta...');
                pool.forEach(i => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(i.name).setValue(i.id)));
                rowMenu.addComponents(select);
            }

            return { embeds: [embed], components: rowMenu.components.length > 0 ? [rowNav, rowMenu] : [rowNav] };
        };

        const response = await message.reply(generarInterfaz());
        const collector = response.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: '⟢ Estas sombras no te pertenecen.', ephemeral: true });

            if (i.customId === 'close') {
                await i.message.delete().catch(() => null);
                return collector.stop();
            }

            if (i.customId === 'go_home') {
                currentCategory = 'home';
                return await i.update(generarInterfaz());
            }

            if (i.customId.startsWith('cat_')) {
                currentCategory = i.customId.replace('cat_', '');
                return await i.update(generarInterfaz());
            }

            // --- ⚙️ Lógica de Reparación ---
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
                await updateUserData(user.id, { inventory: data.inventory });
                await i.reply({ content: `✨ ⊹ **${recipe.name}** restaurado. Esta es su última vida. ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            // --- ⚒️ Lógica de Crafteo ---
            if (i.customId === 'do_craft') {
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === i.values[0]);

                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    if ((data.inventory[mat] || 0) < cant) return i.reply({ content: `🕸️ Te faltan materiales.`, ephemeral: true });
                    data.inventory[mat] -= cant;
                }

                if (Math.random() < failChance) {
                    await updateUserData(user.id, { inventory: data.inventory });
                    return i.reply({ content: `💥 La forja falló. Los materiales se han perdido. 🥀`, ephemeral: true });
                }

                data.inventory[recipe.id] = (data.inventory[recipe.id] || 0) + 1;
                await updateUserData(user.id, { inventory: data.inventory });
                await addXP(user.id, 150, i.client);
                await i.reply({ content: `✨ ⊹ **${recipe.name}** forjado con éxito. ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }
        });
    }
};
