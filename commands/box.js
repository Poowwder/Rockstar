const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'box',
    description: '📦 Abre cajas sorpresa del abismo.',
    category: 'economía',
    data: new SlashCommandBuilder().setName('box').setDescription('📦 Abre cajas sorpresa'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const member = input.member;
        
        let data = await getUserData(user.id);
        const e = () => getRndEmoji(guild);

        let limite = (data.premiumType === 'mensual' || data.premiumType === 'pro') ? 2 : 
                     (data.premiumType === 'bimestral' || data.premiumType === 'ultra') ? 3 : 1;

        if ((data.boxesToday || 0) >= limite) {
            return input.reply(`╰┈➤ ${e()} **¡Paciencia!** Ya reclamaste tus tesoros de hoy (\`${limite}/${limite}\`).`);
        }

        // --- 📊 SISTEMA DE PROBABILIDADES (Total 100%) ---
        const roll = Math.random() * 100;
        let premioGanado;

        if (roll < 5) { 
            // 💎 LEGENDARIO (5%)
            premioGanado = { id: 'pico_cristal', name: 'Pico de Cristal 💎', type: 'tool', dur: 100, rarity: 'LEGENDARIO' };
        } else if (roll < 15) { 
            // 🎣 ÉPICO (10%)
            premioGanado = { id: 'cana_oro', name: 'Caña de Oro 🎣', type: 'tool', dur: 80, rarity: 'ÉPICO' };
        } else if (roll < 45) { 
            // ✨ RARO (30%)
            premioGanado = { id: 'diamante_rosa', name: 'Diamante Rosa ✨', type: 'item', rarity: 'RARO' };
        } else { 
            // 🌸 COMÚN (55%)
            premioGanado = { id: 'flores', name: '15,000 Flores 🌸', type: 'money', value: 15000, rarity: 'COMÚN' };
        }

        // --- ⚙️ PROCESAR PREMIO ---
        data.boxesToday = (data.boxesToday || 0) + 1;
        if (!data.inventory) data.inventory = {};
        if (!data.durabilidades) data.durabilidades = {};

        if (premioGanado.type === 'money') {
            data.wallet += premioGanado.value;
        } else if (premioGanado.type === 'tool') {
            data.inventory[premioGanado.id] = (data.inventory[premioGanado.id] || 0) + 1;
            data.durabilidades[premioGanado.id] = premioGanado.dur;
        } else {
            data.inventory[premioGanado.id] = (data.inventory[premioGanado.id] || 0) + 1;
        }

        await updateUserData(user.id, data);

        // --- 📄 COLORES POR RAREZA ---
        const rarityColor = { 'LEGENDARIO': '#FFD700', 'ÉPICO': '#A020F0', 'RARO': '#00BFFF', 'COMÚN': '#1a1a1a' };

        const boxEmbed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ Regalo del Abismo ˚₊‧ ${e()}`)
            .setColor(rarityColor[premioGanado.rarity] || '#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif')
            .setDescription(
                `> *“El destino ha dictado tu suerte...”*\n\n` +
                `**─── ✦ RESULTADO ✦ ───**\n` +
                `${e()} **Rareza:** \`${premioGanado.rarity}\`\n` +
                `${e()} **Premio:** **${premioGanado.name}**\n` +
                `${e()} **Cajas hoy:** \`${data.boxesToday}/${limite}\`\n` +
                `**─────────────────**\n\n` +
                `╰┈➤ *¡Úsalo antes de que las sombras lo reclamen!*`
            )
            .setFooter({ text: `Rockstar ⊹ Mystery Box`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [boxEmbed] });
    }
};
