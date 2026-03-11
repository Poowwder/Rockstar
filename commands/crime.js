const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'crime',
    description: '🕶️ Adéntrate en las sombras para cometer un atraco...',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('🕶️ Comete un crimen bajo el riesgo de perderlo todo'),
        
    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const member = guild ? (guild.members.cache.get(user.id) || { displayName: user.username }) : { displayName: user.username };
        const rndEmj = getRndEmoji(guild);
        
        let data = await getUserData(user.id);
        
        // --- 🏥 VERIFICACIÓN DE SALUD ---
        if ((data.health || 0) <= 0) {
            const deadEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/8a/cc/b0/8accb071720d2d3129807b1cc1ec3f1e.gif')
                .setDescription(`> 💀 **El cuerpo de ${member.displayName} no resiste más.**\n> ${rndEmj} Estás en cuidados intensivos. Recupérate antes de volver a las calles.`);
            
            // ✅ FIX: Solo usamos ephemeral si es Slash Command
            return input.reply({ embeds: [deadEmbed], ephemeral: isSlash });
        }

        // --- ⚙️ AJUSTE DE RANGOS ---
        let cooldown = 300000, prob = 0.45, vidasP = 1, minG = 2000, maxG = 5000;
        const premium = (data.premiumType || 'none').toLowerCase();

        if (premium === 'pro' || premium === 'mensual') { 
            cooldown = 120000; prob = 0.60; vidasP = 1; minG = 4000; maxG = 8000;
        } else if (premium === 'ultra' || premium === 'bimestral') { 
            cooldown = 0; prob = 0.85; vidasP = 1; minG = 7000; maxG = 15000;
        }

        const lastCrime = data.lastCrime ? new Date(data.lastCrime).getTime() : 0;
        if (cooldown > 0 && Date.now() - lastCrime < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastCrime)) / 1000);
            return input.reply({ content: `⏳ 🚨 La policía patrulla la zona. Vuelve en \`${espera}s\`.`, ephemeral: isSlash });
        }

        // Marcamos el tiempo del crimen DE INMEDIATO para evitar spam
        data.lastCrime = Date.now();

        // --- 🎲 RESULTADO ---
        if (Math.random() > prob) {
            // FALLO
            data.health -= vidasP;
            let lostMoney = 0;
            let outcomeText = "";

            if (data.health <= 0) {
                // Muerte en el acto (activará el renacimiento en userManager)
                lostMoney = data.wallet || 0;
                data.wallet = 0; 
                outcomeText = `\n\n╰┈➤ 💀 **FATAL:** Te atraparon y perdiste tus \`${lostMoney.toLocaleString()} 🌸\`.`;
            } else {
                // Multa menor
                lostMoney = Math.min(data.wallet || 0, 1500); 
                data.wallet -= lostMoney;
                outcomeText = `\n\n╰┈➤ 💸 **Multa:** \`-${lostMoney} 🌸\`\n╰┈➤ ❤️ **Vida:** \`${Math.floor(data.health)}/3\``;
            }

            await updateUserData(user.id, data);
            
            const failEmbed = new EmbedBuilder()
                .setColor('#8b0000')
                .setThumbnail('https://i.pinimg.com/originals/27/a3/9a/27a39a0b9a84a6b1dc92690d297a7ea6.gif')
                .setDescription(`> 🚫 **Atraco fallido, ${member.displayName}.**\n╰┈➤ 🩸 **Daño:** \`-${vidasP}\` corazón ${outcomeText}`);

            return input.reply({ embeds: [failEmbed] });

        } else {
            // ÉXITO
            let gana = Math.floor(Math.random() * (maxG - minG + 1)) + minG;
            data.wallet = (data.wallet || 0) + gana;
            
            await updateUserData(user.id, data);

            const successEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/7e/17/57/7e1757827e852d76f8e75dbf77c3e2e8.gif')
                .setDescription(`> 🕶️ **Crimen perfecto, ${member.displayName}.**\n\n╰┈➤ 💰 **Botín:** \`+${gana.toLocaleString()} 🌸\`\n╰┈➤ 🏦 **Cartera:** \`${data.wallet.toLocaleString()} 🌸\``);

            return input.reply({ embeds: [successEmbed] });
        }
    }
};
