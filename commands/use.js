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
        .addStringOption(opt => opt.setName('item').setDescription('Nombre o ID del objeto').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const e = () => getE(guild);

        // --- 🛠️ DETECTOR INTELIGENTE ---
        const query = isSlash ? input.options.getString('item').toLowerCase() : args?.join(' ').toLowerCase();

        if (!query) return input.reply(`╰┈➤ ${e()} **Dime qué quieres usar.**`);

        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // Buscamos si el query coincide con alguna ID en el inventario
        const itemName = Object.keys(inv).find(id => id.includes(query) && inv[id] > 0);

        if (!itemName) {
            return input.reply(`╰┈➤ ❌ No tienes ese objeto o ya se agotó en tu mochila.`);
        }

        let mensajeExtra = `*“¡Listo para la acción!”*`;
        let estadoItem = `Objeto activado.`;
        let color = '#1a1a1a';
        let usado = false;

        // --- 🧪 LÓGICA DE ITEMS ---

        // ❤️ VIDA / CURACIÓN
        if (itemName.includes("vida") || itemName.includes("pocion_salud")) {
            if (data.health >= 3) {
                return input.reply(`╰┈➤ 🩺 **¡Espera!** Tu salud ya está al máximo (\`${data.health}/3\`).`);
            }
            data.health = Math.min(3, data.health + 1);
            mensajeExtra = `*“¡Sientes cómo tus heridas sanan bajo la luz de Rockstar!”* ❤️`;
            estadoItem = `Salud restaurada a ${Math.floor(data.health)}/3`;
            color = '#ff4d4d';
            usado = true;
        } 
        
        // 🧪 POCIÓN DE XP (De tus misiones)
        else if (itemName.includes("xp_potion") || itemName.includes("pocion_xp")) {
            const xpGanada = Math.floor(Math.random() * 500) + 500;
            data.xp = (data.xp || 0) + xpGanada;
            // Aquí podrías añadir lógica de subir de nivel si la tienes
            mensajeExtra = `*“Un líquido brillante que expande tu conocimiento...”* 🧪`;
            estadoItem = `Has ganado +${xpGanada.toLocaleString()} XP`;
            color = '#3498db';
            usado = true;
        }

        // 🚀 BOOST DE FLORES / MULTIPLICADORES
        else if (itemName.includes("boost_flores")) {
            if (!data.activeBoosts) data.activeBoosts = [];
            
            // Evitar acumular el mismo boost (opcional)
            const yaActivo = data.activeBoosts.find(b => b.id === 'boost_flores');
            if (yaActivo) return input.reply(`╰┈➤ ⏳ Ya tienes un Boost de Flores activo.`);

            data.activeBoosts.push({ 
                id: 'boost_flores', 
                expiresAt: Date.now() + ms('1h'),
                multiplier: 2
            });
            
            mensajeExtra = `*“¡Tus ganancias se multiplicarán por una hora!”* 🌸`;
            estadoItem = `Multiplicador x2 Activado (1h)`;
            color = '#ffb7f5';
            usado = true;
        }

        // ☕ CAFÉ ESTÉTICO (Energía / Cooldowns)
        else if (itemName.includes("cafe")) {
            // Ejemplo: Reducir cooldown de la próxima mina
            data.lastMine = 0; 
            mensajeExtra = `*“Una dosis de cafeína para seguir trabajando en las sombras.”* ☕`;
            estadoItem = `¡Cooldown de minería reiniciado!`;
            color = '#6f4e37';
            usado = true;
        }

        if (!usado) {
            return input.reply(`╰┈➤ ❌ El objeto \`${itemName}\` es un material o reliquia, no se puede "usar" directamente.`);
        }

        // --- 💾 GUARDAR CAMBIOS ---
        inv[itemName] -= 1;
        data.inventory = inv;
        await updateUserData(user.id, data);

        const useEmbed = new EmbedBuilder()
            .setTitle(`${e()} ‧₊˚ OBJETO UTILIZADO ˚₊‧ ${e()}`)
            .setColor(color)
            .setThumbnail('https://i.pinimg.com/originals/8a/0a/8a/8a0a8a8a8a8a8a8a8a8a8a8a8a8a8a8a.gif') // GIF de poción/brillo
            .setDescription(
                `${mensajeExtra}\n\n` +
                `**─── ✦ REGISTRO DE USO ✦ ───**\n` +
                `${e()} **Usaste:** \`${itemName.toUpperCase()}\`\n` +
                `${e()} **Efecto:** \`${estadoItem}\`\n` +
                `**─────────────────**`
            )
            .setFooter({ text: `Usuario: ${user.username} ⊹ Rockstar Nightfall` });

        return input.reply({ embeds: [useEmbed] });
    }
};
