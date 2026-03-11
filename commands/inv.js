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
        // --- ⊹ DETECCIÓN HÍBRIDA MAESTRA ⊹ ---
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const target = isSlash ? (input.options.getUser('usuario') || author) : (input.mentions.users.first() || author);
        const guild = input.guild;
        
        const member = guild ? (guild.members.cache.get(target.id) || { displayName: target.username }) : { displayName: target.username };
        const data = await getUserData(target.id);
        const rndEmj = getRndEmoji(guild);
        
        // --- ⟢ EMOJIS DINÁMICOS POR ÍTEM ⟢ ---
        // Busca un emoji en tu servidor que se llame EXACTAMENTE igual que el ítem. Si no, usa 📦
        const getEmoji = (name) => {
            if (!guild) return '📦';
            const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === name.toLowerCase());
            return emoji ? emoji.toString() : '📦';
        };

        const inventario = data.inventory || {};
        const durabilidades = data.durabilidades || {}; 
        
        // --- ⚙️ CLASIFICACIÓN DE OBJETOS ---
        const herramientas = [];
        const materiales = [];

        Object.entries(inventario).forEach(([key, qty]) => {
            if (qty <= 0) return;

            // Formatea el nombre (ej: "mineral_oro" -> "Mineral Oro")
            const nameNice = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const emoji = getEmoji(key);

            // Filtro para picos y cañas
            if (key.includes('pico') || key.includes('cana')) {
                const dur = durabilidades[key] !== undefined ? ` \`[${durabilidades[key]} usos]\`` : "";
                const estado = key.endsWith('_broken') ? " 🥀 *Roto*" : key.endsWith('_repaired') ? " 🛠️ *Reparado*" : "";
                herramientas.push(`╰┈➤ ${emoji} **${nameNice}**${dur}${estado}`);
            } else {
                materiales.push(`╰┈➤ ${emoji} **${nameNice}** x\`${qty}\``);
            }
        });

        // --- ⊹ CONSTRUCCIÓN DEL EMBED ⊹ ---
        const txtHerramientas = herramientas.length > 0 ? herramientas.join('\n') : "> *Sin herramientas en el cinturón.*";
        const txtMateriales = materiales.length > 0 ? materiales.join('\n') : "> *Mochila vacía... el abismo te espera.*";

        const invEmbed = new EmbedBuilder()
            .setColor('#1a1a1a') // Negro Rockstar
            .setAuthor({ name: `Equipamiento de ${member.displayName}`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setDescription(
                `> *“Lo que cargamos nos define, lo que guardamos nos protege.”* ${rndEmj}\n\n` +
                `**⚒️ ⟢ ₊˚ Equipo Activo ˚₊ ⟣**\n${txtHerramientas}\n\n` +
                `**💎 ⟢ ₊˚ Recursos ˚₊ ⟣**\n${txtMateriales}`
            )
            .setFooter({ text: `Inventario ⊹ Economía Rockstar`, iconURL: guild ? guild.iconURL() : target.displayAvatarURL() });

        return input.reply({ embeds: [invEmbed] });
    }
};
