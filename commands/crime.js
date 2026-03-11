const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'crime',
    description: '🕶️ Comete un atraco bajo el riesgo de perderlo todo.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('🕶️ Comete un crimen bajo el riesgo de perderlo todo'),
        
    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const member = guild ? (guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        const e = () => getRndEmoji(guild);
        
        let data = await getUserData(user.id);
        
        // --- 🏥 VERIFICACIÓN DE SALUD ---
        if ((data.health || 0) <= 0) {
            const deadEmbed = new EmbedBuilder()
                .setTitle(`${e()} FUERA DE COMBATE ${e()}`)
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif')
                .setDescription(`> 💀 **El cuerpo de ${member.displayName} no resiste más.**\n\n╰┈➤ Estás en el hospital. Recupérate antes de volver al abismo.`)
                .setTimestamp()
                .setFooter({ text: `Rockstar Nightfall ⊹ Estado Crítico` });
            return input.reply({ embeds: [deadEmbed] });
        }

        // --- ⚙️ AJUSTE DE RANGOS ---
        let cooldown = 300000, prob = 0.45, vidasP = 1, minG = 2000, maxG = 5000;
        const premium = (data.premiumType || 'none').toLowerCase();

        if (premium === 'pro' || premium === 'mensual') { 
            cooldown = 120000; prob = 0.60; vidasP = 0.5; minG = 4000; maxG = 8000;
        } else if (premium === 'ultra' || premium === 'bimestral') { 
            cooldown = 0; prob = 0.85; vidasP = 0.2; minG = 7000; maxG = 15000;
        }

        const lastCrime = data.lastCrime ? new Date(data.lastCrime).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastCrime < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastCrime)) / 1000);
            return input.reply({ content: `⏳ 🚨 La policía vigila. Vuelve en \`${espera}s\`.`, ephemeral: true });
        }

        // --- 🚀 LÓGICA DE BOOSTS ---
        const now = Date.now();
        data.activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
        const hasMoneyBoost = data.activeBoosts.some(b => b.id === 'boost_flores');
        const multiplier = hasMoneyBoost ? 2 : 1;

        data.lastCrime = now;

        // --- 🎲 RESULTADO ---
        if (Math.random() > prob) {
            // --- FALLO ---
            const healthBefore = data.health;
            data.health -= vidasP;
            
            // ¿Perdió una vida entera? (Cambió el número entero)
            const perdioVidaEntera = Math.floor(healthBefore) > Math.floor(data.health);
            
            let outcomeText = "";
            if (data.health <= 0) {
                data.wallet = 0; 
                outcomeText = `\n╰┈➤ 💀 **ESTADO CRÍTICO:** Has perdido todo tu dinero.`;
            } else {
                const multa = Math.min(data.wallet || 0, 1500); 
                data.wallet -= multa;
                
                // Mostrar daño visual solo si es significativo o si el usuario quiere saber que algo pasó
                const dañoMsg = perdioVidaEntera 
                    ? `❤️ **Corazones:** \`${Math.floor(data.health)}/3\` (¡Has perdido una vida!)`
                    : `🛡️ **Daño:** \`Leve\` (Sigues con ${Math.floor(data.health)} vidas)`;
                
                outcomeText = `\n╰┈➤ 💸 **Multa:** \`-${multa} 🌸\`\n╰┈➤ ${dañoMsg}`;
            }

            await updateUserData(user.id, data);
            
            const failEmbed = new EmbedBuilder()
                .setTitle(`${e()} OPERACIÓN FALLIDA ${e()}`)
                .setColor('#8b0000')
                .setThumbnail('https://i.pinimg.com/originals/27/a3/9a/27a39a0b9a84a6b1dc92690d297a7ea6.gif')
                .setDescription(`> 🚫 **Atraco fallido, ${member.displayName}.**\n${outcomeText}`)
                .setTimestamp()
                .setFooter({ text: `Rockstar ⊹ Sistema de Riesgo`, iconURL: user.displayAvatarURL() });

            return input.reply({ embeds: [failEmbed] });

        } else {
            // --- ÉXITO ---
            let ganaBase = Math.floor(Math.random() * (maxG - minG + 1)) + minG;
            let ganaFinal = ganaBase * multiplier;
            
            data.wallet = (data.wallet || 0) + ganaFinal;
            await updateUserData(user.id, data);

            let boostMsg = hasMoneyBoost ? `\n╰┈➤ 🚀 **Boost Activo:** ¡Ganancia duplicada!` : "";

            const successEmbed = new EmbedBuilder()
                .setTitle(`${e()} CRIMEN PERFECTO ${e()}`)
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/7e/17/57/7e1757827e852d76f8e75dbf77c3e2e8.gif')
                .setDescription(
                    `> 🕶️ **El botín ha sido asegurado, ${member.displayName}.**\n\n` +
                    `╰┈➤ 💰 **Ganancia:** \`+${ganaFinal.toLocaleString()} 🌸\`${boostMsg}\n` +
                    `╰┈➤ 🏦 **Cartera:** \`${data.wallet.toLocaleString()} 🌸\``
                )
                .setTimestamp()
                .setFooter({ text: `Rockstar ⊹ Éxito Criminal`, iconURL: user.displayAvatarURL() });

            return input.reply({ embeds: [successEmbed] });
        }
    }
};
