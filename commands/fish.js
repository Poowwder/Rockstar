const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'fish',
    description: '🎣 Pesca criaturas y objetos en las aguas de las sombras.',
    category: 'economía',
    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        let data = await getUserData(user.id);
        const inv = data.inventory || {};
        const e = () => getE(guild);

        const premium = (data.premiumType || 'none').toLowerCase();
        const isPro = premium === 'pro' || premium === 'mensual' || premium === 'ultra' || premium === 'bimestral';
        const isUltra = premium === 'ultra' || premium === 'bimestral';

        // --- 🗺️ ZONAS Y CAÑAS ---
        let zonas = [
            // ESTÁNDAR (Todos)
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 4 },
            { id: 'cana_legendaria', zona: 'Arrecife Olvidado', multis: 3 },
            { id: 'cana_profesional', zona: 'Lago del Silencio', multis: 2 },
            { id: 'cana_reforzada', zona: 'Río Corriente', multis: 1.5 },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1 },

            // SECRETAS NIVEL 1 (Todos)
            { id: 'cana_void', zona: '✨ Abyss of Stars', multis: 5, secret: true },
            { id: 'cana_espejismo', zona: '✨ Lago Espejismo', multis: 6, secret: true },
            { id: 'cana_aurora', zona: '✨ Costa de la Aurora', multis: 7, secret: true }
        ];

        // SECRETAS NIVEL 2 (Solo Pro y Ultra)
        if (isPro) {
            zonas.push(
                { id: 'cana_carmesi', zona: '✨ Marea Carmesí', multis: 8, secret: true },
                { id: 'cana_estigia', zona: '✨ Aguas Estigias', multis: 9, secret: true },
                { id: 'cana_leviatan', zona: '✨ Fosa del Leviatán', multis: 10, secret: true }
            );
        }

        // SECRETAS NIVEL 3 (Solo Ultra)
        if (isUltra) {
            zonas.push(
                { id: 'cana_cosmos', zona: '✨ Mar Cósmico', multis: 12, secret: true },
                { id: 'cana_paradoja', zona: '✨ Corriente Paradoja', multis: 14, secret: true },
                { id: 'cana_eterna', zona: '✨ Cascada Eterna', multis: 16, secret: true }
            );
        }

        zonas.sort((a, b) => b.multis - a.multis);

        const mejorCana = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorCana) {
            return input.reply({ content: `╰┈➤ ❌ No puedes pescar sin herramientas. Forja una caña en el \`!!craft\` o compra una.`, ephemeral: true });
        }

        let riesgo = 0.15, daño = 1, cooldown = 300000;
        if (isPro) { riesgo = 0.10; daño = 0.5; cooldown = 120000; } 
        if (isUltra) { riesgo = 0.05; daño = 0.2; cooldown = 0; }

        const lastFish = data.lastFish ? new Date(data.lastFish).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastFish < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastFish)) / 1000);
            return input.reply({ content: `⏳ El agua está muy agitada. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        const discoveredKey = `zona_fish_${mejorCana.id}`;
        const isFirstTime = !(inv[discoveredKey] >= 1);
        const thumb = mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif';

        let descripcion = isFirstTime 
            ? `> *Has encontrado una corriente secreta lejos de miradas curiosas...*\n\n╰┈➤ Has llegado a **${mejorCana.zona}**. ¿Prepararás el cebo?`
            : `> *El reflejo de la luna sobre el agua te da la bienvenida.*\n\n╰┈➤ Te encuentras en **${mejorCana.zona}**. Las aguas están en calma.`;

        const embedZona = new EmbedBuilder()
            .setTitle(`${e()} ZONA: ${mejorCana.zona} ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail(thumb)
            .setDescription(descripcion)
            .setFooter({ text: `Equipado: ${mejorCana.id.replace(/_/g, ' ')}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_pescar').setLabel('🎣 Pescar').setStyle(ButtonStyle.Primary)
        );

        const response = await input.reply({ embeds: [embedZona], components: [row], fetchReply: true });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return i.reply({ content: "❌ Este no es tu bote.", ephemeral: true });
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
                data.lastFish = now;
                await updateUserData(user.id, data);

                if (data.health <= 0) {
                    return i.update({ embeds: [new EmbedBuilder().setTitle(`${e()} 💀 Naufragio Fatal`).setColor('#000000').setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif').setDescription(`> *Te has hundido en las profundidades del olvido.*\n\n╰┈➤ 🎒 Tu inventario ha sido saqueado por las mareas.\n╰┈➤ ❤️ Has renacido en la orilla con **3 corazones**.`)] , components: [] });
                }
                return i.update({ content: `🌊 **Ola Gigante:** Casi te arrastra el mar. Perdiste \`${daño}\` de vida. ❤️ Vitalidad: \`${Math.floor(data.health)}/3\``, embeds: [], components: [] });
            }

            const fishMulti = mejorCana.multis * multiplier;
            let report = [];
            let newInv = { ...data.inventory };

            const cantPez = Math.floor(Math.random() * 3 + 1) * fishMulti;
            newInv['common_fish'] = (newInv['common_fish'] || 0) + cantPez;
            report.push(`🐟 **Pescado Común:** \`x${cantPez}\``);

            if (Math.random() > 0.90) {
                const floresTesoro = Math.floor(Math.random() * 1000 + 500) * multiplier;
                data.wallet = (data.wallet || 0) + floresTesoro;
                report.push(`🏺 **Cofre Hundido:** \`+${floresTesoro} 🌸\``);
            }

            data.inventory = newInv;
            data.lastFish = now;
            await updateUserData(user.id, data);

            let boostMsg = multiplier === 2 ? `\n╰┈➤ 🚀 **Boost Activo:** ¡Doble pesca!` : "";
            
            const embedExito = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ name: `Pesca: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(thumb)
                .setDescription(`> *“En el reflejo del agua, la paciencia es poder.”*\n\n**─── ✦ RED DE PESCA ✦ ───**\n${report.join('\n')}${boostMsg}\n**──────────────────**\n❤️ **Vitalidad:** \`${Math.floor(data.health)}/3\``)
                .setFooter({ text: `Equipo: ${mejorCana.id.replace(/_/g, ' ')}` });

            return i.update({ content: null, embeds: [embedExito], components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) input.editReply({ components: [] }).catch(()=>{});
        });
    }
};
