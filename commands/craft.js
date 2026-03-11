const { 
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType 
} = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'craft',
    description: '🛠️ Taller de forja y progresión.',
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

        // --- 📜 PROGRESIÓN EN CADENA ---
        // Para hacer la herramienta N, necesitas el material de la herramienta N-1
        const recipes = {
            picos: [
                // ESTÁNDAR (Todos)
                { id: 'pico_madera', name: 'Púa de Corteza', mats: { wood: 10 }, dur: 15, req: 'none' }, // wood sale del !!daily
                { id: 'pico_piedra', name: 'Triturador de Granito', mats: { mineral_roca: 15 }, dur: 45, req: 'none' },
                { id: 'pico_hierro', name: 'Rompealmas de Acero', mats: { hierro_bruto: 20 }, dur: 120, req: 'none' },
                { id: 'pico_diamante', name: 'Perforador Celestial', mats: { cristal_profundo: 25 }, dur: 350, req: 'none' },
                { id: 'pico_mitico', name: 'Eclipse Eterno', mats: { gema_mitica: 30 }, dur: 800, req: 'none' },
                // SECRETAS NIVEL 1 (Todos)
                { id: 'pico_void', name: 'Pico Void Haven', mats: { fragmento_void: 40 }, dur: 1200, req: 'none' },
                { id: 'pico_astral', name: 'Pico Astral', mats: { polvo_astral: 50 }, dur: 1800, req: 'none' },
                { id: 'pico_runico', name: 'Pico Rúnico', mats: { piedra_runica: 60 }, dur: 2500, req: 'none' },
                // SECRETAS NIVEL 2 (Pro/Ultra)
                { id: 'pico_sangre', name: 'Pico de Sangre', mats: { gema_sangre: 80 }, dur: 3500, req: 'pro' },
                { id: 'pico_sombra', name: 'Pico de Sombras', mats: { esencia_sombra: 100 }, dur: 5000, req: 'pro' },
                { id: 'pico_espectral', name: 'Pico Espectral', mats: { alma_espectral: 120 }, dur: 7000, req: 'pro' },
                // SECRETAS NIVEL 3 (Solo Ultra)
                { id: 'pico_caos', name: 'Núcleo del Caos', mats: { fragmento_caos: 150 }, dur: 10000, req: 'ultra' },
                { id: 'pico_abismal', name: 'Falla Abismal', mats: { gema_abismal: 200 }, dur: 15000, req: 'ultra' },
                { id: 'pico_infinito', name: 'Horizonte Infinito', mats: { cristal_infinito: 300 }, dur: 25000, req: 'ultra' }
            ],
            canas: [
                // ESTÁNDAR (Todos)
                { id: 'cana_basica', name: 'Hilo de Seda', mats: { wood: 10 }, dur: 10, req: 'none' }, // wood sale del !!daily
                { id: 'cana_reforzada', name: 'Garra de Río', mats: { hilo_reforzado: 15 }, dur: 35, req: 'none' },
                { id: 'cana_profesional', name: 'Señuelo Abisal', mats: { cebo_profesional: 20 }, dur: 100, req: 'none' },
                { id: 'cana_legendaria', name: 'Atrapasueños Marino', mats: { escama_legendaria: 25 }, dur: 300, req: 'none' },
                { id: 'cana_divina', name: 'Lágrima de Neptuno', mats: { lagrima_divina: 30 }, dur: 800, req: 'none' },
                // SECRETAS NIVEL 1 (Todos)
                { id: 'cana_void', name: 'Caña Abyss of Stars', mats: { estrella_abismal: 40 }, dur: 1200, req: 'none' },
                { id: 'cana_espejismo', name: 'Caña Espejismo', mats: { agua_espejismo: 50 }, dur: 1800, req: 'none' },
                { id: 'cana_aurora', name: 'Caña de la Aurora', mats: { luz_aurora: 60 }, dur: 2500, req: 'none' },
                // SECRETAS NIVEL 2 (Pro/Ultra)
                { id: 'cana_carmesi', name: 'Caña Carmesí', mats: { coral_carmesi: 80 }, dur: 3500, req: 'pro' },
                { id: 'cana_estigia', name: 'Caña Estigia', mats: { agua_estigia: 100 }, dur: 5000, req: 'pro' },
                { id: 'cana_leviatan', name: 'Caña del Leviatán', mats: { hueso_leviatan: 120 }, dur: 7000, req: 'pro' },
                // SECRETAS NIVEL 3 (Solo Ultra)
                { id: 'cana_cosmos', name: 'Mar Cósmico', mats: { polvo_cosmico: 150 }, dur: 10000, req: 'ultra' },
                { id: 'cana_paradoja', name: 'Corriente Paradoja', mats: { escama_paradoja: 200 }, dur: 15000, req: 'ultra' },
                { id: 'cana_eterna', name: 'Cascada Eterna', mats: { gota_eterna: 300 }, dur: 25000, req: 'ultra' }
            ]
        };

        let data = await getUserData(userId);
        if (!data.inventory) data.inventory = {};
        
        const prem = (data.premiumType || 'none').toLowerCase();
        const isPro = prem === 'pro' || prem === 'mensual' || prem === 'ultra' || prem === 'bimestral';
        const isUltra = prem === 'ultra' || prem === 'bimestral';

        let failChance = 0.20; 
        if (isPro) failChance = 0.10; 
        if (isUltra) failChance = 0.05; 

        let currentCategory = 'home';

        const generarInterfaz = () => {
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setFooter({ text: `✦ ${user.username} ⊹ Alquimia`, iconURL: user.displayAvatarURL() });

            const rows = [];
            const rowNav = new ActionRowBuilder();

            if (currentCategory === 'home') {
                embed.setTitle(`${getRndEmoji()} ⟢ ₊˚ Taller Rockstar ˚₊ ⟣ ${getRndEmoji()}`)
                    .setDescription(`> *“Para alcanzar nuevas profundidades, primero debes dominar las actuales.”*\n\n╰┈➤ Selecciona tu especialidad.`);

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

                rowNav.addComponents(new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'));
                rows.push(rowNav);

                if (brokenItems.length > 0) {
                    const select = new StringSelectMenuBuilder().setCustomId('do_repair').setPlaceholder('Selecciona un objeto roto...');
                    brokenItems.forEach(([id]) => select.addOptions(new StringSelectMenuOptionBuilder().setLabel(id.replace('_broken', '').replace(/_/g, ' ').toUpperCase()).setValue(id)));
                    rows.push(new ActionRowBuilder().addComponents(select));
                }
            }
            else {
                const pool = recipes[currentCategory].filter(i => {
                    if (i.req === 'none') return true;
                    if (i.req === 'pro' && isPro) return true;
                    if (i.req === 'ultra' && isUltra) return true;
                    return false;
                });

                embed.setTitle(`${getRndEmoji()} ⊹ Sección: ${currentCategory.toUpperCase()} ⊹ ${getRndEmoji()}`)
                    .setDescription(pool.map(i => {
                        const matsText = Object.entries(i.mats).map(([m, c]) => `\`${c}x ${m}\``).join(', ');
                        return `**${i.name}**\n╰ 📦 Requiere: ${matsText}\n╰ 🛡️ Dur: \`${i.dur}\` ⊹ 💥 Riesgo: \`${(failChance * 100).toFixed(0)}%\``;
                    }).join('\n\n'));

                rowNav.addComponents(new ButtonBuilder().setCustomId('go_home').setLabel('Inicio').setStyle(ButtonStyle.Secondary).setEmoji('🏠'));
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

            if (i.customId === 'do_repair') {
                const brokenId = i.values[0];
                const originalId = brokenId.replace('_broken', '');
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === originalId);

                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    const cost = Math.ceil(cant / 2);
                    if ((data.inventory[mat] || 0) < cost) return i.reply({ content: `🕸️ Te faltan materiales. Necesitas \`${cost}x ${mat}\`.`, ephemeral: true });
                }

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

            if (i.customId === 'do_craft') {
                const recipeId = i.values[0];
                const recipe = [...recipes.picos, ...recipes.canas].find(r => r.id === recipeId);

                let missing = [];
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    if ((data.inventory[mat] || 0) < cant) missing.push(`\`${cant}x ${mat}\``);
                }
                if (missing.length > 0) return i.reply({ content: `🕸️ Te faltan materiales. Necesitas: ${missing.join(', ')}`, ephemeral: true });

                let newInv = { ...data.inventory };
                for (const [mat, cant] of Object.entries(recipe.mats)) {
                    newInv[mat] -= cant;
                }

                if (Math.random() < failChance) {
                    data.inventory = newInv;
                    await updateUserData(userId, data);
                    return i.reply({ content: `💥 La forja ha colapsado. Los materiales se han perdido en el abismo. 🥀`, ephemeral: true });
                }

                newInv[recipe.id] = (newInv[recipe.id] || 0) + 1;
                data.inventory = newInv;
                await updateUserData(userId, data);
                
                await i.reply({ content: `✨ **${recipe.name}** forjado con éxito. Ya puedes equiparlo en la zona. ✦`, ephemeral: true });
                return await i.message.edit(generarInterfaz());
            }

            await i.update(generarInterfaz());
        });

        collector.on('end', () => {
            // Lógica híbrida para limpiar componentes al terminar el tiempo
            if (isSlash) {
                input.editReply({ components: [] }).catch(() => null);
            } else {
                response.edit({ components: [] }).catch(() => null);
            }
        });
    }
};
