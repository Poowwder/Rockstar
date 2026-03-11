const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'mine',
    description: '⛏️ Extrae materiales de las profundidades de la tierra.',
    category: 'economía',
    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        let data = await getUserData(user.id);
        const inv = data.inventory || {};
        const e = () => getE(guild);

        // --- ⚙️ IDENTIFICADOR DE RANGOS ---
        const premium = (data.premiumType || 'none').toLowerCase();
        const isPro = premium === 'pro' || premium === 'mensual' || premium === 'ultra' || premium === 'bimestral';
        const isUltra = premium === 'ultra' || premium === 'bimestral';

        // --- 🗺️ ZONAS Y DROPS PROGRESIVOS ---
        let zonas = [
            // ESTÁNDAR (Todos)
            { id: 'pico_mitico', zona: 'Abismo Eterno', multis: 5, drop: 'fragmento_void', emj: '🌌' },
            { id: 'pico_diamante', zona: 'Fosa de Cristal', multis: 4, drop: 'gema_mitica', emj: '🔮' },
            { id: 'pico_hierro', zona: 'Venas de Acero', multis: 3, drop: 'cristal_profundo', emj: '💎' },
            { id: 'pico_piedra', zona: 'Caverna de Cuarzo', multis: 2, drop: 'hierro_bruto', emj: '⛓️' },
            { id: 'pico_madera', zona: 'Gruta Superficial', multis: 1, drop: 'mineral_roca', emj: '🪨' },

            // SECRETAS NIVEL 1 (Todos)
            { id: 'pico_void', zona: '✨ Void Haven', multis: 6, drop: 'polvo_astral', emj: '✨', secret: true },
            { id: 'pico_astral', zona: '✨ Mina Astral', multis: 7, drop: 'piedra_runica', emj: '🗿', secret: true },
            { id: 'pico_runico', zona: '✨ Ruinas Rúnicas', multis: 8, drop: 'gema_sangre', emj: '🩸', secret: true }
        ];

        // SECRETAS NIVEL 2 (Solo Pro y Ultra)
        if (isPro) {
            zonas.push(
                { id: 'pico_sangre', zona: '✨ Fosa de Sangre', multis: 10, drop: 'esencia_sombra', emj: '🌑', secret: true },
                { id: 'pico_sombra', zona: '✨ Eco de las Sombras', multis: 12, drop: 'alma_espectral', emj: '👻', secret: true },
                { id: 'pico_espectral', zona: '✨ Cueva Espectral', multis: 14, drop: 'fragmento_caos', emj: '🌪️', secret: true }
            );
        }

        // SECRETAS NIVEL 3 (Solo Ultra)
        if (isUltra) {
            zonas.push(
                { id: 'pico_caos', zona: '✨ Núcleo del Caos', multis: 16, drop: 'gema_abismal', emj: '👁️', secret: true },
                { id: 'pico_abismal', zona: '✨ Falla Abismal', multis: 18, drop: 'cristal_infinito', emj: '♾️', secret: true },
                { id: 'pico_infinito', zona: '✨ Horizonte Infinito', multis: 22, drop: 'materia_oscura', emj: '🌌', secret: true } // Materia oscura: Drop final para vender caro
            );
        }

        zonas.sort((a, b) => b.multis - a.multis);
        const mejorPico = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorPico) return input.reply({ content: `╰┈➤ ❌ No puedes minar sin herramientas. Forja un pico en el \`!!craft\` o compra uno.`, ephemeral: true });

        // --- ⚙️ RIESGO Y COOLDOWN ---
        let riesgo = 0.15, daño = 1, cooldown = 300000;
        if (isPro) { riesgo = 0.10; daño = 0.5; cooldown = 120000; } 
        if (isUltra) { riesgo = 0.05; daño = 0.2; cooldown = 0; }

        const lastMine = data.lastMine ? new Date(data.lastMine).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastMine < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastMine)) / 1000);
            return input.reply({ content: `⏳ El polvo no se ha asentado. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        const discoveredKey = `zona_mine_${mejorPico.id}`;
        const isFirstTime = !(inv[discoveredKey] >= 1);
        const thumb = mejorPico.secret ? 'https://i.pinimg.com/originals/7b/0a/61/7b0a61833503b414f6b0f1a91e3e7f91.gif' : 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif';

        let descripcion = isFirstTime 
            ? `> *Has descubierto una ruta inexplorada en las profundidades...*\n\n╰┈➤ Te adentras por primera vez en **${mejorPico.zona}**. ¿Estás listo?`
            : `> *El silencio de la piedra te da la bienvenida de nuevo.*\n\n╰┈➤ Te encuentras en **${mejorPico.zona}**. Las profundidades aguardan.`;

        const embedZona = new EmbedBuilder()
            .setTitle(`${e()} ZONA: ${mejorPico.zona} ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail(thumb)
            .setDescription(descripcion)
            .setFooter({ text: `Equipado: ${mejorPico.id.replace(/_/g, ' ')}` });

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_minar').setLabel('⛏️ Minar').setStyle(ButtonStyle.Secondary));
        const response = await input.reply({ embeds: [embedZona], components: [row], fetchReply: true });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: "❌ Esta no es tu expedición.", ephemeral: true });
            collector.stop();

            if (isFirstTime) {
                if (!data.inventory) data.inventory = {};
                data.inventory[discoveredKey] = 1;
            }

            const now = Date.now();
            data.activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
            const multiplier = data.activeBoosts.some(b => b.id === 'boost_flores') ? 2 : 1;

            if (Math.random() < riesgo) {
                data.health -= daño;
                data.lastMine = now;
                await updateUserData(user.id, data);
                if (data.health <= 0) {
                    return i.update({ embeds: [new EmbedBuilder().setTitle(`${e()} 💀 Derrumbe Fatal`).setColor('#000000').setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif').setDescription(`> *La montaña ha reclamado tu esencia.*\n\n╰┈➤ 🎒 Parte de tus materiales se han perdido.\n╰┈➤ ❤️ Has sido rescatado y tu salud vuelve a **3 corazones**.`)] , components: [] });
                }
                return i.update({ content: `⚠️ **Derrumbe:** Las piedras te han golpeado. Perdiste \`${daño}\` de vida. ❤️ Vitalidad: \`${Math.floor(data.health)}/3\``, embeds: [], components: [] });
            }

            const minMulti = mejorPico.multis * multiplier; 
            let newInv = { ...data.inventory };
            let report = [];

            // Drop de progresión asegurado
            const cantDrop = Math.floor(Math.random() * 3 + 2) * minMulti;
            newInv[mejorPico.drop] = (newInv[mejorPico.drop] || 0) + cantDrop;
            report.push(`${mejorPico.emj} **${mejorPico.drop.replace(/_/g, ' ').toUpperCase()}**: \`x${cantDrop}\``);

            // Extras al azar
            if (Math.random() > 0.80) {
                const oro = 500 * minMulti;
                data.wallet = (data.wallet || 0) + oro;
                report.push(`💰 **Piedras Preciosas:** \`+${oro} 🌸\``);
            }

            data.inventory = newInv;
            data.lastMine = now;
            await updateUserData(user.id, data);

            let boostMsg = multiplier === 2 ? `\n╰┈➤ 🚀 **Boost Activo:** ¡Doble recolección!` : "";
            const embedExito = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ name: `Minería: ${mejorPico.zona}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(thumb)
                .setDescription(`> *“El abismo recompensa a los audaces.”*\n\n**─── ✦ EXTRACCIÓN ✦ ───**\n${report.join('\n')}${boostMsg}\n**───────────────────**\n❤️ **Vitalidad:** \`${Math.floor(data.health)}/3\``)
                .setFooter({ text: `Equipo: ${mejorPico.id.replace(/_/g, ' ')}` });

            return i.update({ content: null, embeds: [embedExito], components: [] });
        });
        collector.on('end', collected => { if (collected.size === 0) input.editReply({ components: [] }).catch(()=>{}); });
    }
};
