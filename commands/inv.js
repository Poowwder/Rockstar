const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR PARA DECORACIÓN ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

module.exports = {
    name: 'inv',
    aliases: ['inventario', 'inventory', 'items', 'mochila'],
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
            if (!guild) return '📦';
            // Busca emojis que contengan el nombre (ej: "pico" encuentra "pico_oro")
            const emoji = guild.emojis.cache.find(e => e.name.toLowerCase().includes(key.toLowerCase()));
            return emoji ? emoji.toString() : '📦';
        };

        const inventario = data.inventory || {};
        const durabilidades = data.durabilidades || {}; 
        
        const herramientas = [];
        const materiales = [];

        // Palabras clave para identificar herramientas compradas
        const toolKeywords = ['pico', 'cana', 'hacha', 'pala', 'martillo'];

        Object.entries(inventario).forEach(([key, qty]) => {
            if (qty <= 0) return;

            // Formatea el nombre: "pico_piedra" -> "Pico Piedra"
            const nameNice = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const emoji = getEmoji(key);

            // ¿Es una herramienta?
            const isTool = toolKeywords.some(word => key.toLowerCase().includes(word));

            if (isTool) {
                const dur = durabilidades[key] !== undefined ? ` \`[${durabilidades[key]} usos]\`` : "";
                const estado = key.endsWith('_broken') ? " 🥀 *Roto*" : "";
                herramientas.push(`╰┈➤ ${emoji} **${nameNice}**${dur}${estado}`);
            } else {
                materiales.push(`╰┈➤ ${emoji} **${nameNice}** x\`${qty}\``);
            }
        });

        // --- ⊹ CONSTRUCCIÓN DEL EMBED ⊹ ---
        const txtHerramientas = herramientas.length > 0 ? herramientas.join('\n') : "> *Cinturón de herramientas vacío.*";
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
                `**💎 ⟢ ₊˚ Recursos ˚₊ ⟣**\n${txtMateriales}`
            )
            .setFooter({ text: `Rockstar ⊹ Eternal Vault` });

        return input.reply({ embeds: [invEmbed] });
    }
};
