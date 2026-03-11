const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType 
} = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'craft',
    description: '🛠️ Taller de forja y restauración aesthetic.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('🛠️ Fabrica o repara herramientas mágicas'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const userId = user.id;

        const getRndEmoji = () => {
            const emojis = guild?.emojis.cache.filter(e => e.available);
            return (emojis && emojis.size > 0) ? emojis.random().toString() : '✨';
        };

        // --- 📜 RECETAS (Nombres de materiales sincronizados con la DB) ---
        const recipes = {
            picos: [
                { id: 'pico_madera', name: 'Púa de Corteza', mats: { wood: 5 }, dur: 15, premium: false },
                { id: 'pico_piedra', name: 'Triturador de Granito', mats: { stone: 10 }, dur: 45, premium: false },
                { id: 'pico_hierro', name: 'Rompealmas de Acero', mats: { iron_ore: 8 }, dur: 120, premium: false },
                { id: 'pico_diamante', name: 'Perforador Celestial', mats: { diamante_rosa: 5 }, dur: 350, premium: false },
                { id: 'pico_mitico', name: 'Eclipse Eterno', mats: { diamante_rosa: 10, stone: 50 }, dur: 2000, premium: true }
            ],
            canas: [
                { id: 'cana_basica', name: 'Hilo de Seda', mats: { wood: 3, string: 2 }, dur: 10, premium: false },
                { id: 'cana_reforzada', name: 'Garra de Río', mats: { wood: 5, iron_ore: 2 }, dur: 35, premium: false },
                { id: 'cana_profesional', name: 'Señuelo Abisal', mats: { iron_ore: 5, diamante_rosa: 1 }, dur: 100, premium: false },
                { id: 'cana_legendaria', name: 'Atrapasueños Marino', mats: { diamante_rosa: 5, perla: 2 }, dur: 300, premium: false },
                { id: 'cana_divina', name: 'Lágrima de Neptuno', mats: { diamante_rosa: 10, esencia: 1 }, dur: 1500, premium: true }
            ]
        };

        let data = await getUserData(userId);
        if (!data.inventory) data.inventory = {};
        
        let failChance = 0.20; 
        const prem = (data.premiumType || 'none').toLowerCase();
        if (prem === 'pro' || prem === 'mensual') failChance = 0.10; 
        if (prem === 'ultra' || prem === 'bimestral') failChance = 0.05; 

        let currentCategory = 'home';

        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Alquimia`, iconURL: user.displayAvatarURL() });

            const rows = [];
            const rowNav = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Taller Rockstar ˚₊ ⟣ ${getRndEmoji()}`)
                    .setDescription(`> *“Lo que se rompe puede sanar, pero lo que se descuida se pierde...”*\n\n╰┈➤ Bienvenida la persona artesana. ¿Qué deseas hacer hoy?`);

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('cat_picos').setLabel('PICOS').setStyle(ButtonStyle.Secondary).setEmoji('⚒️'),
                    new ButtonBuilder().setCustomId('cat_canas').setLabel('CAÑAS').setStyle(ButtonStyle.Secondary).setEmoji('🎣'),
                    new ButtonBuilder().setCustomId('cat_repair').setLabel('REPARAR').setStyle(ButtonStyle.Secondary).setEmoji('🛠️'),
                    new ButtonBuilder().setCustomId('close').setLabel('CERRAR').setStyle(ButtonStyle.Danger)
                );
                rows.push(rowNav);
            } 
            else if (currentCategory === 'repair') {
                const brokenItems = Object.entries(data.inventory).filter(([id, qty]) => id.endsWith('_broken') && qty > 0);
                embed.setTitle(`${getRndEmoji()} ⊹ Restauración ⊹ ${getRndEmoji()}`)
                    .setDescription(brokenItems.length > 0 ? brokenItems.map(([id]) => `╰┈➤ **${id.replace('_broken', '').replace(/_/g, ' ').toUpperCase()}**\n 🎀 *Costo:* 50% materiales originales.`).join('\n\n') : "> 🥀 *No hay herramientas rotas en tu inventario.*");

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                );
                rows.push(rowNav);

                if (brokenItems.length > 0) {
                    const select = new StringSelectMenuBuilder().setCustomId('do_repair').setPlaceholder('Selecciona un objeto roto...');
                    brokenItems.forEach(([id]) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(id.replace('_broken', '').toUpperCase()).setValue(id)));
                    rows.push(new ActionRowBuilder().addComponents(select));
                }
            }
            else {
                // Mostrar Picos o Cañas
                const pool = recipes[currentCategory].filter(i => !i.premium || (prem !== 'none'));
                embed.setTitle(`${getRndEmoji()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`)
                    .setDescription(pool.map(i => {
                        const matsText = Object.entries(i.mats).map(([m, c]) => `\`${c}x ${m}\``).join(', ');
                        return `**${i.name}**\n╰ 📦 Requiere: ${matsText}\n╰ 🛡️ Dur: \`${i.dur}\` ⊹ 💥 Riesgo: \`${(failChance * 100).toFixed(0)}%\``;
                    }).join('\n\n'));

                rowNav.addComponents(
                    new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                );
                rows.push(rowNav);

                const select = new StringSelectMenuBuilder().setCustomId('do_craft').setPlaceholder('Forjar herramienta...');
                pool.forEach(i => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(i.name).setValue(i.id)));
                rows.push(new ActionRowBuilder().addComponents(select));
            }
            return { embeds: [embed], components: rows };
        };

        const response = await input.reply({ ...generarInterfaz(), fetchReply: true });
        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: '╰┈➤ ❌ Estas sombras no te pertenecen.', ephemeral: true });

            if (i.customId === 'close') { 
                await i.message.delete().catch(() => null); 
                return collector.stop(); 
            }
            if (i.customId === 'go_home') currentCategory = 'home';
            else if (i.customId.startsWith('cat_')) currentCategory = i.customId.replace('cat_', '');

            // --- 🛠️ LÓGICA DE REPARACIÓN ---
            if (i.customId === 'do_repair') {
                const brokenId = i.values[0];
                const originalId = brokenId.replace('_broken', '');
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === originalId);

                // 1. Verificar TODO primero (Anti-Robo)
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    const cost = Math.ceil(cant / 2);
                    if ((data.inventory[mat] || 0) < cost) return i.reply({ content: `🕸️ Te faltan materiales. Necesitas \`${cost}x ${mat}\`.`, ephemeral: true });
                }

                // 2. Cobrar materiales y clonar inventario para que MongoDB guarde
                let newInv = { ...data.inventory };
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    newInv[mat] -= Math.ceil(cant / 2);
                }

                newInv[brokenId] -= 1;
                newInv[`${originalId}_repaired`] = (newInv[`${originalId}_repaired`] || 0) + 1;
                data.inventory = newInv;

                await updateUserData(userId, data);
                await i.reply({ content: `✨ **${recipe.name}** ha sido restaurado. ¡Es su última vida! ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            // --- ⚒️ LÓGICA DE CRAFTEO ---
            if (i.customId === 'do_craft') {
                const recipeId = i.values[0];
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === recipeId);

                // 1. Verificar TODO primero (Anti-Robo)
                let missing = [];
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    if ((data.inventory[mat] || 0) < cant) missing.push(`\`${cant}x ${mat}\``);
                }
                if (missing.length > 0) return i.reply({ content: `🕸️ Te faltan materiales. Necesitas: ${missing.join(', ')}`, ephemeral: true });

                // 2. Cobrar materiales y clonar inventario
                let newInv = { ...data.inventory };
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    newInv[mat] -= cant;
                }

                // 3. Probabilidad de Fallo
                if (Math.random() < failChance) {
                    data.inventory = newInv; // Se guardan los cobros aunque falle
                    await updateUserData(userId, data);
                    return i.reply({ content: `💥 La forja ha colapsado. Los materiales se han perdido en el abismo. 🥀`, ephemeral: true });
                }

                // 4. Éxito
                newInv[recipe.id] = (newInv[recipe.id] || 0) + 1;
                data.inventory = newInv;
                await updateUserData(userId, data);
                
                await i.reply({ content: `✨ **${recipe.name}** forjado con éxito. Ya puedes equiparlo. ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            await i.update(generarInterfaz());
        });

        collector.on('end', () => {
            input.editReply({ components: [] }).catch(() => null);
        });
    }
};
