const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR PARA DECORACIÓN ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

// --- 🎨 DICCIONARIO DE EMOJIS POR DEFECTO ---
// Si no tienes un emoji personalizado en el server, usará estos:
const FALLBACK_EMOJIS = {
    'wood': '🪵', 'stone': '🪨', 'iron_ore': '⛓️', 'common_fish': '🐟',
    'diamante_rosa': '✨', 'boost_flores': '🚀', 'pico_madera': '⛏️',
    'pico_hierro': '⛏️', 'pico_mitico': '⛏️', 'pico_void': '🌌',
    'cana_basica': '🎣', 'cana_divina': '🎣', 'cana_void': '🌌'
};

module.exports = {
    name: 'inv',
    aliases: ['inventario', 'inventory', 'items', 'mochila'],
    description: '🎒 Mira los objetos que tienes en tu mochila.',
    category: 'economía',
    usage: '!!inv [@usuario]',
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('🎒 Mira los objetos que tienes en tu mochila')
        .addUserOption(option => option.setName('usuario').setDescription('Ver el inventario de otra persona')),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const target = isSlash ? (input.options.getUser('usuario') || author) : (input.mentions.users.first() || author);
        const guild = input.guild;
        
        const member = guild ? (guild.members.cache.get(target.id) || { displayName: target.username }) : { displayName: target.username };
        const data = await getUserData(target.id);
        const rndEmj = getRndEmoji(guild);
        
        // --- ⟢ BUSCADOR DE EMOJIS MEJORADO ⟢ ---
        const getEmoji = (key) => {
            if (guild) {
                const customEmoji = guild.emojis.cache.find(e => e.name.toLowerCase().includes(key.toLowerCase()));
                if (customEmoji) return customEmoji.toString();
            }
            // Si no hay emoji en el server, busca en el diccionario. Si no, usa la caja.
            return FALLBACK_EMOJIS[key] || '📦';
        };

        const inventario = data.inventory || {};
        const durabilidades = data.durabilidades || {}; 
        
        const herramientas = [];
        const materiales = [];
        const especiales = [];

        // Palabras clave para categorizar
        const toolKeywords = ['pico', 'cana', 'hacha', 'pala', 'martillo'];
        const specialKeywords = ['boost', 'koko', 'diamante'];

        Object.entries(inventario).forEach(([key, qty]) => {
            if (qty <= 0) return;
            
            // 🚫 FILTRO DE INVISIBILIDAD: Ignorar banderas de zonas y sistema
            if (key.startsWith('zona_') || key.startsWith('sys_')) return;

            // Formatea el nombre: "iron_ore" -> "Iron Ore"
            const nameNice = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const emoji = getEmoji(key);

            // Categorización
            const isTool = toolKeywords.some(word => key.toLowerCase().includes(word));
            const isSpecial = specialKeywords.some(word => key.toLowerCase().includes(word));

            if (isTool) {
                const dur = durabilidades[key] !== undefined ? ` \`[${durabilidades[key]} usos]\`` : "";
                const estado = key.endsWith('_broken') ? " 🥀 *Roto*" : "";
                // Herramientas no muestran cantidad (se asume que equipas 1) a menos que quieras
                herramientas.push(`╰┈➤ ${emoji} **${nameNice}**${dur}${estado}`);
            } else if (isSpecial) {
                especiales.push(`╰┈➤ ${emoji} **${nameNice}** \`x${qty}\``);
            } else {
                materiales.push(`╰┈➤ ${emoji} **${nameNice}** \`x${qty}\``);
            }
        });

        // --- ⊹ CONSTRUCCIÓN DEL EMBED ⊹ ---
        const txtHerramientas = herramientas.length > 0 ? herramientas.join('\n') : "> *Cinturón de herramientas vacío.*";
        const txtEspeciales = especiales.length > 0 ? especiales.join('\n') + '\n\n' : "";
        const txtMateriales = materiales.length > 0 ? materiales.join('\n') : "> *No hay recursos en la mochila.*";

        const invEmbed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ 
                name: `Mochila de ${target.username}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setDescription(
                `> *“Lo que cargamos nos define, lo que guardamos nos protege.”* ${rndEmj}\n\n` +
                `**⚒️ ⟢ ₊˚ Herramientas ˚₊ ⟣**\n${txtHerramientas}\n\n` +
                (especiales.length > 0 ? `**🚀 ⟢ ₊˚ Objetos Raros ˚₊ ⟣**\n${txtEspeciales}` : '') +
                `**💎 ⟢ ₊˚ Recursos ˚₊ ⟣**\n${txtMateriales}`
            )
            .setFooter({ text: `Rockstar ⊹ Eternal Vault` });

        return input.reply({ embeds: [invEmbed] });
    }
};
