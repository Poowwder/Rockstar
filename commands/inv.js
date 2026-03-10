const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'inv',
    aliases: ['inventario', 'inventory', 'items', 'mochila'],
    category: 'economia',
    usage: '!!inv [@usuario]',
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('🎒 Mira los objetos que tienes en tu mochila')
        .addUserOption(option => option.setName('usuario').setDescription('Ver el inventario de otra persona')),

    async execute(input) {
        // --- ⊹ Detección Híbrida ⊹ ---
        const isSlash = !input.author;
        const target = isSlash ? (input.options.getUser('usuario') || input.user) : (input.mentions.users.first() || input.author);
        const guild = input.guild;
        
        const data = await getUserData(target.id);
        
        // --- ⟢ Emojis Dinámicos del Servidor ⟢ ---
        const getEmoji = (name) => {
            const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === name.toLowerCase());
            return emoji ? emoji.toString() : '✨';
        };

        const inventario = data.inventory || {};
        const durabilidades = data.durabilidades || {}; // Asegúrate de guardar durabilidad aquí
        
        // --- ⚙️ Clasificación de Objetos ---
        const herramientas = [];
        const materiales = [];

        Object.entries(inventario).forEach(([key, qty]) => {
            if (qty <= 0) return;

            const nameNice = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const emoji = getEmoji(key);

            // Si es un pico, caña o algo con durabilidad
            if (key.includes('pico') || key.includes('cana')) {
                const dur = durabilidades[key] !== undefined ? ` \`[${durabilidades[key]} usos]\`` : "";
                const estado = key.endsWith('_broken') ? " 🥀 *Roto*" : key.endsWith('_repaired') ? " 🛠️ *Reparado*" : "";
                herramientas.push(`╰┈➤ ${emoji} **${nameNice}**${dur}${estado}`);
            } else {
                materiales.push(`╰┈➤ ${emoji} **${nameNice}** x\`${qty}\``);
            }
        });

        // --- ⊹ Construcción del Embed ⊹ ---
        const invEmbed = new EmbedBuilder()
            .setColor('#1a1a1a') // Negro Gótico
            .setAuthor({ name: `Mochila de ${target.username}`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setFooter({ text: `✦ Rockstar Inventory ⊹ Alquimia de Sombras`, iconURL: guild.iconURL() });

        // Sección de Herramientas
        const txtHerramientas = herramientas.length > 0 ? herramientas.join('\n') : "*Sin herramientas activas.*";
        
        // Sección de Materiales
        const txtMateriales = materiales.length > 0 ? materiales.join('\n') : "*Mochila vacía... ve a minar.*";

        invEmbed.setDescription(
            `> *“Lo que cargamos nos define, lo que guardamos nos protege.”* ⊹\n\n` +
            `**⚒️ ⟢ ₊˚ Equipo Actual ˚₊ ⟣**\n${txtHerramientas}\n\n` +
            `**💎 ⟢ ₊˚ Recursos ˚₊ ⟣**\n${txtMateriales}`
        );

        return isSlash ? input.reply({ embeds: [invEmbed] }) : input.reply({ embeds: [invEmbed] });
    }
};
