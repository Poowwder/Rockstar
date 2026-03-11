const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

const boxesPath = path.join(__dirname, '../data/lootboxes.json');

// --- ✨ EMOJIS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'box',
    description: '📦 Abre tu caja de suministros diaria.',
    category: 'economía',
    data: new SlashCommandBuilder().setName('box').setDescription('📦 Abre tu caja sorpresa diaria'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getRndEmoji(guild);
        
        // 1. Cargar configuración de cajas
        if (!fs.existsSync(boxesPath)) return input.reply("❌ Error: No se encontró el archivo `lootboxes.json`.");
        const lootConfig = JSON.parse(fs.readFileSync(boxesPath, 'utf8'));

        let data = await getUserData(user.id);

        // 2. Límites por Rango (Normal 1, Pro 2, Ultra 3)
        const premium = (data.premiumType || 'none').toLowerCase();
        let limite = (premium === 'pro' || premium === 'mensual') ? 2 : 
                     (premium === 'ultra' || premium === 'bimestral') ? 3 : 1;

        if ((data.boxesToday || 0) >= limite) {
            return input.reply(`╰┈➤ ${e()} **¡Límite alcanzado!** Vuelve mañana para más suministros (\`${limite}/${limite}\`).`);
        }

        // 3. Selección de Caja (Por ahora la 'common_lootbox')
        const boxData = lootConfig['common_lootbox'];
        if (!boxData) return input.reply("❌ Error: Configuración de caja no encontrada.");

        // --- 🎲 LÓGICA DE PROBABILIDADES ---
        const roll = Math.random() * 100;
        let acumulado = 0;
        let premioFinal = null;

        for (const item of boxData.contents) {
            acumulado += item.chance;
            if (roll <= acumulado) {
                const cantidad = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                premioFinal = { id: item.id, qty: cantidad };
                break;
            }
        }

        // 4. Actualizar Base de Datos
        if (!data.inventory) data.inventory = {};
        data.inventory[premioFinal.id] = (data.inventory[premioFinal.id] || 0) + premioFinal.qty;
        data.boxesToday = (data.boxesToday || 0) + 1;

        await updateUserData(user.id, data);

        // --- 📄 PRESENTACIÓN ---
        const nameNice = premioFinal.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        const boxEmbed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ Suministros Rockstar ˚₊‧ ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/ec/7b/03/ec7b036573c734b41a542031336c1c87.gif')
            .setDescription(
                `*“El abismo te entrega lo que necesitas para sobrevivir...”*\n\n` +
                `**─── ✦ CONTENIDO ✦ ───**\n` +
                `${e()} **Caja:** \`${boxData.name}\`\n` +
                `${e()} **Recibiste:** **${nameNice}** x${premioFinal.qty}\n` +
                `${e()} **Uso diario:** \`${data.boxesToday}/${limite}\` cajas\n` +
                `**─────────────────**\n\n` +
                `╰┈➤ *Guarda esto bien en tu \`!!inv\`.*`
            )
            .setFooter({ text: `Rockstar ⊹ Eternal Vault`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [boxEmbed] });
    }
};
