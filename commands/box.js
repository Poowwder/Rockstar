const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR ---
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

        // 1. Límites según Rango
        let limite = (data.premiumType === 'mensual' || data.premiumType === 'pro') ? 2 : 
                     (data.premiumType === 'bimestral' || data.premiumType === 'ultra') ? 3 : 1;

        if ((data.boxesToday || 0) >= limite) {
            return input.reply(`╰┈➤ ${e()} **¡Paciencia!** Ya reclamaste tus tesoros de hoy (\`${limite}/${limite}\`).`);
        }

        // --- 🎁 TABLA DE PREMIOS (Con IDs para la DB) ---
        const listaPremios = [
            { id: 'pico_cristal', name: 'Pico de Cristal 💎', type: 'tool', dur: 100 },
            { id: 'cana_oro', name: 'Caña de Oro 🎣', type: 'tool', dur: 80 },
            { id: 'diamante_rosa', name: 'Diamante Rosa ✨', type: 'item' },
            { id: 'flores', name: '15,000 Flores 🌸', type: 'money', value: 15000 }
        ];

        const premioGanado = listaPremios[Math.floor(Math.random() * listaPremios.length)];

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

        // Guardar cambios forzando la actualización
        await updateUserData(user.id, data);

        const boxEmbed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ Un Regalo de las Sombras ˚₊‧ ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif')
            .setDescription(
                `> *“¿Qué habrá dentro de este lazo?”*\n\n` +
                `**─── ✦ CONTENIDO ✦ ───**\n` +
                `${e()} **Encontraste:** **${premioGanado.name}**\n` +
                `${e()} **Cajas hoy:** \`${data.boxesToday}/${limite}\`\n` +
                `**─────────────────**\n\n` +
                `╰┈➤ *El abismo te ha favorecido, úsalo con sabiduría.*`
            )
            .setFooter({ text: `Rockstar ⊹ Eternal Box`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [boxEmbed] });
    }
};
