const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'fish',
    category: 'economia',
    usage: '!!fish',
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('🎣 Pesca en aguas misteriosas y enfrenta guardianes.'),

    async execute(input) {
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        let data = await getUserData(user.id);

        if ((data.health || 0) <= 0) {
            return input.reply({ content: "🥀 **El cansancio nubla tu vista.** Debes recuperar vitalidad para volver a pescar.", ephemeral: true });
        }

        // --- ⚙️ LÓGICA DE ZONAS Y CAÑAS ---
        const inv = data.inventory || {};
        const dur = data.durabilidades || {};
        const isPremium = data.premiumType === 'pro' || data.premiumType === 'ultra';

        let zonas = [
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 4, chanceBoss: 0.15, boss: 'Leviatán de Cristal' },
            { id: 'cana_legendaria', zona: 'Arrecife de Almas', multis: 2.5, chanceBoss: 0.10, boss: 'Kraken Sombrío' },
            { id: 'cana_profesional', zona: 'Mar Profundo', multis: 1.8, chanceBoss: 0.05, boss: 'Siren Corrupta' },
            { id: 'cana_reforzada', zona: 'Bahía Niebla', multis: 1.3, chanceBoss: 0, boss: null },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1, chanceBoss: 0, boss: null }
        ];

        // --- 🌌 ZONA SECRETA PREMIUM ---
        if (isPremium) {
            zonas.unshift({ 
                id: 'cana_divina', 
                zona: '✨ Abyss of Stars (Secreta)', 
                multis: 6, 
                chanceBoss: 0.25, 
                boss: 'Deidad del Vacío',
                secret: true 
            });
        }

        // Buscamos la mejor caña disponible
        const mejorCana = zonas.find(z => (inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0));

        if (!mejorCana) {
            return input.reply({ content: "🕸️ **Sin aparejos.** Necesitas una caña para tentar al destino.", ephemeral: true });
        }

        const canaIdActiva = inv[mejorCana.id] > 0 ? mejorCana.id : `${mejorCana.id}_repaired`;

        // --- ⏳ COOLDOWN ---
        let cooldown = 300000;
        if (data.premiumType === 'pro') cooldown = 120000;
        if (data.premiumType === 'ultra') cooldown = 0;

        if (cooldown > 0 && Date.now() - (data.lastFish || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (Date.now() - (data.lastFish || 0))) / 1000);
            return input.reply({ content: `⏳ La marea está alta. Espera \`${restante}s\`.`, ephemeral: true });
        }

        // --- 👹 LÓGICA DE JEFES MARINOS ---
        if (mejorCana.boss && Math.random() < mejorCana.chanceBoss) {
            const ganoCombate = Math.random() > 0.45; // 55% de ganar
            if (!ganoCombate) {
                data.health -= 4;
                await updateUserData(user.id, { health: Math.max(0, data.health), lastFish: Date.now() });
                return input.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`👹 Emergiendo: ${mejorCana.boss}`)
                        .setColor('#1a1a1a')
                        .setThumbnail('https://i.pinimg.com/originals/93/43/e8/9343e8081604a180f69a304f21629813.gif')
                        .setDescription(`El guardián de las profundidades ha destrozado tu red. Has escapado por poco.\n\n💔 **Vitalidad perdida:** 4`)]
                });
            } else {
                const botinBoss = Math.floor(2200 * mejorCana.multis);
                data.wallet = (data.wallet || 0) + botinBoss;
                const material_extra = mejorCana.secret ? '🌟 1x Perla Estelar' : '🐚 1x Concha de Nácar';
                data.inventory[mejorCana.secret ? 'perla_estelar' : 'concha_nacar'] = (data.inventory[mejorCana.secret ? 'perla_estelar' : 'concha_nacar'] || 0) + 1;
                
                await updateUserData(user.id, { wallet: data.wallet, inventory: data.inventory, lastFish: Date.now() });

                return input.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle(`⚔️ Victoria sobre ${mejorCana.boss}`)
                        .setColor('#A2D2FF')
                        .setDescription(`Has dominado a la bestia marina. El océano te entrega su tesoro.\n\n💰 **Botín:** \`${botinBoss}\` flores\n📦 **Extra:** ${material_extra}`)]
                });
            }
        }

        // --- ✨ PESCA NORMAL ---
        let flores = Math.floor(Math.random() * 450 + 550) * mejorCana.multis;
        let materiales = [];

        const agregar = (key, min, max, emoji) => {
            const cant = Math.floor(Math.random() * (max - min + 1)) + min;
            data.inventory[key] = (data.inventory[key] || 0) + cant;
            materiales.push(`${emoji} \`${cant}x ${key.replace('_', ' ')}\``);
        };

        // Materiales de pesca
        agregar('fish', 1, 3, '🐟');
        if (Math.random() < 0.30) agregar('seaweed', 2, 4, '🌿');
        if (Math.random() < 0.15) agregar('pearl', 1, 1, '⚪');
        if (mejorCana.secret) agregar('stardust_fragment', 1, 2, '✨');

        // --- 🛠️ DESGASTE DE CAÑA ---
        data.durabilidades[canaIdActiva] = (data.durabilidades[canaIdActiva] || 0) - 1;
        let avisoRotura = "";

        if (data.durabilidades[canaIdActiva] <= 0) {
            data.inventory[canaIdActiva] -= 1;
            if (canaIdActiva.endsWith('_repaired')) {
                avisoRotura = "\n\n🥀 **La caña se ha partido en mil pedazos.** Inservible.";
            } else {
                data.inventory[`${canaIdActiva}_broken`] = (data.inventory[`${canaIdActiva}_broken`] || 0) + 1;
                avisoRotura = "\n\n💥 **El sedal se ha roto.** Necesitas repararlo en el taller.";
            }
            delete data.durabilidades[canaIdActiva];
        }

        await updateUserData(user.id, {
            wallet: (data.wallet || 0) + flores,
            inventory: data.inventory,
            durabilidades: data.durabilidades,
            lastFish: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Aguas: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif')
            .setDescription(
                `> *“En el reflejo del agua, la paciencia es la única moneda.”*\n\n` +
                `**💰 Ganancia:** \`${flores.toFixed(0)}\` flores\n` +
                `**📦 Hallazgos:** ${materiales.join(' ⊹ ')}\n\n` +
                `❤️ **Vitalidad:** \`${data.health.toFixed(1)}\`${avisoRotura}`
            )
            .setFooter({ text: `Equipado: ${canaIdActiva.toUpperCase()}` });

        return input.reply({ embeds: [embed] });
    }
};
