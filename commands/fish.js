const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'fish',
    description: 'Prueba tu suerte en las aguas de las sombras 🎣',
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
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 4 },
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1 }
        ];
        
        if (data.premiumType && data.premiumType !== 'none') {
            zonas.unshift({ id: 'cana_void', zona: '✨ Abyss of Stars', multis: 6, secret: true });
        }

        const mejorCana = zonas.find(z => (inv[z.id] || 0) > 0 || (inv[`${z.id}_repaired`] || 0) > 0);

        if (!mejorCana) {
            return input.reply({ content: `╰┈➤ ❌ No puedes pescar con las manos. Compra una caña en la \`!!shop\`.`, ephemeral: true });
        }

        // --- ⚙️ 2. CONFIGURACIÓN DE RANGOS Y COOLDOWN ---
        let riesgo = 0.15, daño = 1, cooldown = 300000;
        const premium = (data.premiumType || 'none').toLowerCase();

        if (premium === 'pro' || premium === 'mensual') { 
            riesgo = 0.10; daño = 0.5; cooldown = 120000; 
        } else if (premium === 'ultra' || premium === 'bimestral') { 
            riesgo = 0.05; daño = 0.2; cooldown = 0; 
        }

        const lastFish = data.lastFish ? new Date(data.lastFish).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastFish < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastFish)) / 1000);
            return input.reply({ content: `⏳ El agua está muy agitada. Reintenta en \`${espera}s\`.`, ephemeral: true });
        }

        // --- 🚀 3. LÓGICA DE BOOSTS ---
        const now = Date.now();
        data.activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
        const hasMoneyBoost = data.activeBoosts.some(b => b.id === 'boost_flores');
        const multiplier = hasMoneyBoost ? 2 : 1;

        // --- 💀 4. LÓGICA DE RIESGO (ACCIDENTE) ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            data.lastFish = now;

            // Si muere, updateUserData se encarga de la purga de materiales y vidas
            await updateUserData(user.id, data);

            if (data.health <= 0) {
                const deathEmbed = new EmbedBuilder()
                    .setTitle(`${e()} 💀 Naufragio Fatal`)
                    .setColor('#000000')
                    .setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif')
                    .setDescription(`> *Te has hundido en las profundidades del olvido.*\n\n╰┈➤ 🎒 Tu inventario ha sido saqueado por las mareas.\n╰┈➤ ❤️ Has renacido en la orilla con **3 corazones**.`)
                    .setFooter({ text: 'La muerte no es el fin, solo un nuevo gasto.' });

                return input.reply({ embeds: [deathEmbed] });
            }

            return input.reply(`🌊 **Ola Gigante:** Casi te arrastra el mar. Perdiste \`${daño}\` de vida. ❤️ Vitalidad: \`${Math.floor(data.health)}/3\``);
        }

        // --- 💰 5. CÁLCULO DE CAPTURA ---
        const floresBase = Math.floor(Math.random() * 500 + 500) * mejorCana.multis;
        const floresFinales = floresBase * multiplier;

        data.wallet = (data.wallet || 0) + floresFinales;
        data.lastFish = now;

        await updateUserData(user.id, data);

        let boostMsg = hasMoneyBoost ? `\n╰┈➤ 🚀 **Boost:** ¡X2 Flores activado!` : "";

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Pesca: ${mejorCana.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorCana.secret ? 'https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif' : 'https://i.pinimg.com/originals/c1/91/97/c1919702221b6a3867623a652d92160d.gif')
            .setDescription(
                `> *“En el reflejo del agua, la paciencia es poder.”*\n\n` +
                `💰 **Ganancia:** \`+${floresFinales.toLocaleString()} 🌸\`${boostMsg}\n` +
                `❤️ **Vitalidad:** \`${Math.floor(data.health)}/3\``
            )
            .setFooter({ text: `Equipo: ${mejorCana.id.replace(/_/g, ' ')}` });

        return input.reply({ embeds: [embed] });
    }
};
