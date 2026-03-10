const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR ---
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
                .setDescription(`> 💀 **El cuerpo de ${member.displayName} no resiste más.**\n> ${rndEmj} Te encuentras en la sala de emergencias de las sombras.\n> *Recupera tus vidas antes de volver a delinquir.*`);
            return input.reply({ embeds: [deadEmbed], ephemeral: true });
        }

        // --- ⚙️ SISTEMA VIP (AHORA CON GANANCIAS ESCALADAS) ---
        // Valores por defecto (Usuario Normal)
        let cooldown = 300000; // 5 minutos
        let prob = 0.45;       // 45% de éxito
        let vidasP = 2;        // Pierde 2 vidas si falla
        let minGanancia = 2000;
        let maxGanancia = 5000;

        const premium = data.premiumType || 'ninguno';

        if (premium === 'mensual') { 
            cooldown = 120000;     // 2 minutos
            prob = 0.60;           // 60% de éxito
            vidasP = 1;            // Pierde 1 vida
            minGanancia = 4000;    // Gana mínimo 4k
            maxGanancia = 8000;    // Gana hasta 8k
        }
        if (premium === 'bimestral') { 
            cooldown = 0;          // Sin cooldown
            prob = 0.80;           // 80% de éxito
            vidasP = 0.5;          // Pierde solo media vida
            minGanancia = 7000;    // Gana mínimo 7k
            maxGanancia = 15000;   // Gana hasta 15k
        }

        const lastCrime = data.lastCrime || 0;

        // --- ⏳ SISTEMA DE ESPERA (COOLDOWN) ---
        if (cooldown > 0 && cooldown - (Date.now() - lastCrime) > 0) {
            const time = cooldown - (Date.now() - lastCrime);
            const minutes = Math.floor(time / (1000 * 60));
            const seconds = Math.floor((time % (1000 * 60)) / 1000);
            
            const cooldownEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/1a/1d/1f/1a1d1f05efeb15ddb78b548b1111d4d0.gif')
                .setDescription(`> 🚨 **Las autoridades vigilan la zona, ${member.displayName}.**\n> ${rndEmj} Mantén un perfil bajo y vuelve a intentarlo en **${minutes}m ${seconds}s**.`);
            return input.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }

        // --- 🎲 RESOLUCIÓN DEL CRIMEN ---
        if (Math.random() > prob) {
            // ❌ FALLÓ EL CRIMEN
            data.health -= vidasP;
            let lostMoney = 0;
            let outcomeText = "";
            let failThumbnail = "";

            if (data.health <= 0) {
                data.health = 0;
                lostMoney = data.wallet || 0;
                data.wallet = 0; 
                outcomeText = `\n\n╰┈➤ 💀 **HAS CAÍDO EN EL INTENTO.**\nLas heridas fueron fatales. Las autoridades han confiscado absolutamente todas las flores de tus bolsillos: \`-${lostMoney.toLocaleString()} 🌸\`.`;
                failThumbnail = 'https://i.pinimg.com/originals/27/a3/9a/27a39a0b9a84a6b1dc92690d297a7ea6.gif';
            } else {
                lostMoney = Math.min(data.wallet || 0, 1200); 
                data.wallet -= lostMoney;
                outcomeText = `\n\n╰┈➤ 💸 **Multa Policial:** \`-${lostMoney.toLocaleString()} 🌸\`\n╰┈➤ ❤️ **Vidas restantes:** \`${data.health}\``;
                failThumbnail = 'https://i.pinimg.com/originals/5c/41/27/5c41272fc4eeb00d8fcd07f79434863f.gif';
            }

            await updateUserData(user.id, data);

            const failEmbed = new EmbedBuilder()
                .setColor('#8b0000') 
                .setThumbnail(failThumbnail)
                .setDescription(`> 🚫 **El atraco ha salido terriblemente mal, ${member.displayName}.**\n\n╰┈➤ 🩸 **Daño recibido:** \`-${vidasP} vidas\` ${rndEmj}${outcomeText}`)
                .setFooter({ text: `Sistema de Crimen ⊹ Economía`, iconURL: user.displayAvatarURL({ dynamic: true }) });

            return input.reply({ embeds: [failEmbed] });

        } else {
            // ✅ ÉXITO EN EL CRIMEN (Botín dinámico por VIP)
            let gana = Math.floor(Math.random() * (maxGanancia - minGanancia + 1)) + minGanancia;
            
            data.wallet = (data.wallet || 0) + gana;
            data.lastCrime = Date.now(); 
            
            await updateUserData(user.id, data);

            const winEmbed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/7e/17/57/7e1757827e852d76f8e75dbf77c3e2e8.gif')
                .setDescription(
                    `> 🕶️ **Un atraco limpio y sin dejar rastros, ${member.displayName}.** ${rndEmj}\n\n` +
                    `╰┈➤ 💰 **Botín obtenido:** \`+${gana.toLocaleString()} 🌸\`\n` +
                    `╰┈➤ 🏦 **Bolsillos:** \`${data.wallet.toLocaleString()} 🌸\``
                )
                .setFooter({ text: `Crimen Perfecto ⊹ VIP: ${premium.charAt(0).toUpperCase() + premium.slice(1)}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

            return input.reply({ embeds: [winEmbed] });
        }
    }
};
