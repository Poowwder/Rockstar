const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'mine',
    category: 'economia',
    usage: '!!mine',
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('⛏️ Explora minas y enfrenta guardianes.'),

    async execute(input) {
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        let data = await getUserData(user.id);

        if ((data.health || 0) <= 0) {
            return input.reply({ content: "🥀 **El cuerpo no responde.** Debes recuperar vitalidad para descender nuevamente.", ephemeral: true });
        }

        // --- ⚙️ LÓGICA DE ZONAS Y REQUISITOS ---
        const inv = data.inventory || {};
        const dur = data.durabilidades || {};
        const isPremium = data.premiumType === 'pro' || data.premiumType === 'ultra';

        let zonas = [
            { id: 'pico_mitico', zona: 'Abismo Eterno', multis: 4, chanceBoss: 0.15, boss: 'Sombra Ancestral' },
            { id: 'pico_diamante', zona: 'Cavernas de Cristal', multis: 2.5, chanceBoss: 0.10, boss: 'Gólem de Cuarzo' },
            { id: 'pico_hierro', zona: 'Venas de Acero', multis: 1.8, chanceBoss: 0.05, boss: 'Excavador Corrupto' },
            { id: 'pico_piedra', zona: 'Cantera Gris', multis: 1.3, chanceBoss: 0, boss: null },
            { id: 'pico_madera', zona: 'Gruta Superficial', multis: 1, chanceBoss: 0, boss: null }
        ];

        // --- 🌌 ZONA SECRETA PREMIUM ---
        if (isPremium) {
            zonas.unshift({ 
                id: 'pico_mitico', // O cualquier pico fuerte
                zona: '✨ Void Haven (Secreta)', 
                multis: 6, 
                chanceBoss: 0.25, 
                boss: 'Guardián del Vacío',
                secret: true 
            });
        }

        const mejorPico = zonas.find(z => (inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0));

        if (!mejorPico) {
            return input.reply({ content: "🕸️ **Sin herramientas.** Necesitas un pico para extraer recursos.", ephemeral: true });
        }

        const picoIdActivo = inv[mejorPico.id] > 0 ? mejorPico.id : `${mejorPico.id}_repaired`;

        // --- ⏳ COOLDOWN ---
        let cooldown = 300000;
        if (data.premiumType === 'pro') cooldown = 120000;
        if (data.premiumType === 'ultra') cooldown = 0;

        if (cooldown > 0 && Date.now() - (data.lastMine || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (Date.now() - (data.lastMine || 0))) / 1000);
            return input.reply({ content: `⏳ La zona está inestable. Reintenta en \`${restante}s\`.`, ephemeral: true });
        }

        // --- 👹 LÓGICA DE JEFES ---
        if (mejorPico.boss && Math.random() < mejorPico.chanceBoss) {
            const ganoCombate = Math.random() > 0.40; // 60% de ganar
            if (!ganoCombate) {
                data.health -= 5;
                await updateUserData(user.id, { health: Math.max(0, data.health), lastMine: Date.now() });
                return input.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`👹 Encuentro Fatal: ${mejorPico.boss}`)
                        .setColor('#450a0a')
                        .setThumbnail('https://i.pinimg.com/originals/93/43/e8/9343e8081604a180f69a304f21629813.gif')
                        .setDescription(`El guardián de la zona te ha emboscado. Has huido con heridas graves.\n\n💔 **Vitalidad perdida:** 5`)]
                });
            } else {
                // Recompensa masiva por vencer al jefe
                const botinBoss = Math.floor(2000 * mejorPico.multis);
                data.wallet = (data.wallet || 0) + botinBoss;
                materiales_extra = mejorPico.secret ? '💎 1x Esencia del Vacío' : '💍 1x Reliquia Antigua';
                data.inventory[mejorPico.secret ? 'esencia_vacio' : 'reliquia'] = (data.inventory[mejorPico.secret ? 'esencia_vacio' : 'reliquia'] || 0) + 1;
                
                await updateUserData(user.id, { wallet: data.wallet, inventory: data.inventory, lastMine: Date.now() });

                return input.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`⚔️ Victoria sobre ${mejorPico.boss}`)
                        .setColor('#facc15')
                        .setDescription(`Has derrotado al guardián. Su botín ahora te pertenece.\n\n💰 **Botín:** \`${botinBoss}\` flores\n📦 **Extra:** ${materiales_extra}`)]
                });
            }
        }

        // --- ✨ EXTRACCIÓN NORMAL ---
        let flores = Math.floor(Math.random() * 400 + 500) * mejorPico.multis;
        let materiales = [];

        const agregar = (key, min, max, emoji) => {
            const cant = Math.floor(Math.random() * (max - min + 1)) + min;
            data.inventory[key] = (data.inventory[key] || 0) + cant;
            materiales.push(`${emoji} \`${cant}x ${key.replace('_', ' ')}\``);
        };

        agregar('wood', 1, 3, '🪵');
        agregar('stone', 2, 5, '🪨');
        if (Math.random() < 0.40) agregar('iron_ore', 1, 2, '⛓️');
        if (mejorPico.secret) agregar('vacio_cristal', 1, 2, '🔮');

        // --- 🛠️ DESGASTE ---
        data.durabilidades[picoIdActivo] = (data.durabilidades[picoIdActivo] || 0) - 1;
        let avisoRotura = "";

        if (data.durabilidades[picoIdActivo] <= 0) {
            data.inventory[picoIdActivo] -= 1;
            if (picoIdActivo.endsWith('_repaired')) {
                avisoRotura = "\n\n🥀 **Herramienta desintegrada.** Se ha perdido para siempre.";
            } else {
                data.inventory[`${picoIdActivo}_broken`] = (data.inventory[`${picoIdActivo}_broken'] || 0) + 1;
                avisoRotura = "\n\n💥 **Herramienta dañada.** Necesita reparación.";
            }
            delete data.durabilidades[picoIdActivo];
        }

        await updateUserData(user.id, {
            wallet: (data.wallet || 0) + flores,
            inventory: data.inventory,
            durabilidades: data.durabilidades,
            lastMine: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Mina: ${mejorPico.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorPico.secret ? 'https://i.pinimg.com/originals/7b/0a/61/7b0a61833503b414f6b0f1a91e3e7f91.gif' : 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif')
            .setDescription(
                `> *“En el silencio de la piedra, el valor es tu única luz.”*\n\n` +
                `**💰 Ganancia:** \`${flores.toFixed(0)}\` flores\n` +
                `**📦 Hallazgos:** ${materiales.join(' ⊹ ')}\n\n` +
                `❤️ **Vitalidad:** \`${data.health.toFixed(1)}\`${avisoRotura}`
            )
            .setFooter({ text: `Equipado: ${picoIdActivo.toUpperCase()}` });

        return input.reply({ embeds: [embed] });
    }
};
