const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'fish',
    description: 'Pesca criaturas y objetos en las aguas de las sombras 🎣',
    category: 'economía',
    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        
        let data = await getUserData(user.id);
        const inv = data.inventory || {};
        const e = () => getE(guild);

        // --- 🎣 1. VERIFICACIÓN DE HERRAMIENTAS ---
        const zonas = [
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 3 },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1 }
        ];
        
        if (data.premiumType && data.premiumType !== 'none') {
            zonas.unshift({ id: 'cana_void', zona: '✨ Abyss of Stars', multis: 5, secret: true });
        }

        const mejorCana = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorCana) {
            return input.reply({ content: `╰┈➤ ❌ No puedes pescar con las manos. Compra una caña en la \`!!shop\`.`, ephemeral: true });
        }

        let riesgo = 0.15, daño = 1, cooldown = 300000;
        const premium = (data.premiumType || 'none').toLowerCase();

        if (premium === 'pro' || premium === 'mensual') { riesgo = 0.10; daño = 0.5; cooldown = 120000; } 
        else if (premium === 'ultra' || premium === 'bimestral') { riesgo = 0.05; daño = 0.2; cooldown = 0; }

        const lastFish = data.lastFish ? new Date(data.lastFish).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastFish < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastFish)) / 1000);
            return input.reply({ content: `⏳ El agua está muy agitada. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        const discoveredKey = `zona_fish_${mejorCana.id}`;
        const isFirstTime = !(inv[discoveredKey] >= 1);
        const thumb = mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif';

        let descripcion = isFirstTime 
            ? `> *Has encontrado una nueva zona para pescar lejos de miradas curiosas...*\n\n╰┈➤ Has llegado a **${mejorCana.zona}**. ¿Prepararás el cebo?`
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
                    const deathEmbed = new EmbedBuilder()
                        .setTitle(`${e()} 💀 Naufragio Fatal`)
                        .setColor('#000000')
                        .setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif')
                        .setDescription(`> *Te has hundido en las profundidades del olvido.*\n\n╰┈➤ 🎒 Tu inventario ha sido saqueado por las mareas.\n╰┈➤ ❤️ Has renacido en la orilla con **3 corazones**.`)
                        .setFooter({ text: 'La muerte no es el fin, solo un nuevo gasto.' });
                    return i.update({ embeds: [deathEmbed], components: [] });
                }
                return i.update({ content: `🌊 **Ola Gigante:** Casi te arrastra el mar. Perdiste \`${daño}\` de vida. ❤️ Vitalidad: \`${Math.floor(data.health)}/3\``, embeds: [], components: [] });
            }

            // --- 🐟 CÁLCULO DE MATERIALES ---
            const fishMulti = mejorCana.multis * multiplier;
            let report = [];
            if (!data.inventory) data.inventory = {};

            // Pescado común
            const cantPez = Math.floor(Math.random() * 3 + 1) * fishMulti;
            data.inventory['common_fish'] = (data.inventory['common_fish'] || 0) + cantPez;
            report.push(`🐟 **Pescado Común:** \`x${cantPez}\``);

            // Tesoro Oculto (10% de sacar flores directas del agua)
            if (Math.random() > 0.90) {
                const floresTesoro = Math.floor(Math.random() * 1000 + 500) * multiplier;
                data.wallet = (data.wallet || 0) + floresTesoro;
                report.push(`🏺 **Cofre Hundido:** \`+${floresTesoro} 🌸\``);
            }

            data.lastFish = now;
            await updateUserData(user.id, data);

            let boostMsg = multiplier === 2 ? `\n╰┈➤ 🚀 **Boost Activo:** ¡Doble pesca!` : "";
            
            const embedExito = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ name: `Pesca: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(thumb)
                .setDescription(
                    `> *“En el reflejo del agua, la paciencia es poder.”*\n\n` +
                    `**─── ✦ RED DE PESCA ✦ ───**\n` +
                    `${report.join('\n')}${boostMsg}\n` +
                    `**──────────────────**\n` +
                    `❤️ **Vitalidad:** \`${Math.floor(data.health)}/3\``
                )
                .setFooter({ text: `Equipo: ${mejorCana.id.replace(/_/g, ' ')}` });

            return i.update({ content: null, embeds: [embedExito], components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) input.editReply({ components: [] }).catch(()=>{});
        });
    }
};
