const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const ms = require('ms');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'use',
    description: '✨ Usa un objeto de tu inventario.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Usa o equipa un objeto de tu inventario')
        .addStringOption(opt => opt.setName('item').setDescription('ID del objeto').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const itemName = isSlash ? input.options.getString('item').toLowerCase() : args?.[0]?.toLowerCase();

        if (!itemName) return input.reply(`╰┈➤ ${getE(guild)} **Dime qué quieres usar.**`);

        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // 1. Verificar si tiene el item (Lógica de Objeto)
        if (!inv[itemName] || inv[itemName] <= 0) {
            return input.reply(`╰┈➤ ❌ No tienes \`${itemName}\` en tu mochila.`);
        }

        let mensajeExtra = `*“¡Listo para la acción!”*`;
        let estadoItem = `Objeto activado.`;
        let color = '#1a1a1a';

        // --- 🧪 LÓGICA DE ITEMS ---

        // ❤️ VIDA EXTRA
        if (itemName.includes("vida")) {
            if (data.health >= 3) {
                return input.reply(`╰┈➤ 🩺 **¡Espera!** Tu salud ya está al máximo (\`${data.health}/3\`).`);
            }
            inv[itemName] -= 1;
            data.health = Math.min(3, data.health + 1);
            mensajeExtra = `*“¡Sientes cómo tus heridas sanan!”* ❤️`;
            estadoItem = `Salud restaurada a ${Math.floor(data.health)}/3`;
            color = '#ff4d4d';
        } 
        
        // 🚀 BOOST DE FLORES (Ejemplo)
        else if (itemName === 'boost_flores') {
            inv[itemName] -= 1;
            if (!data.activeBoosts) data.activeBoosts = [];
            data.activeBoosts.push({ id: 'boost_flores', expiresAt: Date.now() + ms('1h') });
            mensajeExtra = `*“¡Tus ganancias se multiplicarán por una hora!”* 🌸`;
            estadoItem = `Multiplicador x2 Activado (1h)`;
            color = '#ffb7f5';
        }

        else {
            return input.reply(`╰┈➤ ❌ El objeto \`${itemName}\` no tiene una función de uso definida.`);
        }

        // 2. Guardar cambios
        data.inventory = inv;
        await updateUserData(user.id, data);

        const useEmbed = new EmbedBuilder()
            .setTitle(`${getE(guild)} ‧₊˚ Objeto Utilizado ˚₊‧ ${getE(guild)}`)
            .setColor(color)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `${mensajeExtra}\n\n` +
                `**─── ✦ REGISTRO ✦ ───**\n` +
                `${getE(guild)} **Usaste:** \`${itemName}\`\n` +
                `${getE(guild)} **Efecto:** \`${estadoItem}\`\n` +
                `**─────────────────**`
            )
            .setFooter({ text: `Acción: ${user.username} ⊹ Rockstar Nightfall` });

        return input.reply({ embeds: [useEmbed] });
    }
};
