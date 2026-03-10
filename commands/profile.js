const { 
    EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');
const { getUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'profile',
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('🎀 Mira tu perfil detallado o el de otra persona')
        .addUserOption(opt => opt.setName('u').setDescription('Usuario')),

    async execute(input) {
        const isSlash = !!input.user;
        const authorId = isSlash ? input.user.id : input.author.id;
        const target = isSlash ? (input.options.getUser('u') || input.user) : (input.mentions.users.first() || input.author);
        const member = input.guild.members.cache.get(target.id) || { displayName: target.username };
        
        // --- 📂 EXTRACCIÓN DE DATOS ---
        const data = await getUserData(target.id);
        const profileDB = await UserProfile.findOne({ UserID: target.id, GuildID: input.guild.id });

        const OWNER_ID = '1134261491745493032'; 
        const isOwner = (target.id === OWNER_ID);
        
        let rankTitle = data.premiumType ? data.premiumType.toUpperCase() : "USUARIO";
        if (isOwner) rankTitle = "𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆";

        // --- 🐱 LÓGICA DE NEKOS (NEKOTINA STYLE) ---
        const hasNeko = (imgPart) => profileDB?.Nekos?.some(url => url.toLowerCase().includes(imgPart.toLowerCase())) || false;

        const collection = [
            { name: 'Solas', icon: '☁️', check: hasNeko('SOLAS') },
            { name: 'Nyx', icon: '🌑', check: hasNeko('NYX') },
            { name: 'Mizuki', icon: '🌸', check: hasNeko('MIZUKI') },
            { name: 'Astra', icon: '👑', check: hasNeko('ASTRA') },
            { name: 'Koko', icon: '🍓', check: hasNeko('KOKO') }
        ];

        const visibleNekos = collection
            .filter(n => n.check === true)
            .map(n => `\`${n.icon} ${n.name}\``)
            .join('  ');

        // --- ❤️ BARRA DE SALUD ---
        const vMax = 3;
        const vActual = data.health ?? 3;
        const filled = Math.round((Math.min(vActual / vMax, 1)) * 10);
        const barraSalud = "🌸".repeat(filled) + "🤍".repeat(10 - filled); 

        // --- 🔘 FILA DE BOTONES ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main').setEmoji(emojis.pinkbow).setLabel('Perfil').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('stats').setEmoji(emojis.star).setLabel('Status').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('harem').setEmoji(emojis.heart).setLabel('Harem').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exit').setEmoji(emojis.heart).setStyle(ButtonStyle.Danger)
        );

        // --- 📄 PÁGINA 1: PERFIL PRINCIPAL ---
        const mainEmbed = () => new EmbedBuilder()
            .setTitle(`${emojis.star} ‧₊˚ Perfil Rockstar ˚₊‧ ${emojis.star}`)
            .setColor(isOwner ? '#E6E6FA' : '#FFB6C1')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `*“${data.mood || "Brillando con luz propia..."}”* ✨\n\n` +
                `**୨୧ ┈┈┈┈ 𐐪 Rango 𐑂 ┈┈┈┈ ୨୧**\n` +
                `> **${rankTitle}**\n\n` +
                (visibleNekos ? `**୨୧ ┈┈┈┈ 𐐪 Nekos 𐑂 ┈┈┈┈ ୨୧**\n> ${visibleNekos}\n\n` : "") +
                `**୨୧ ┈┈┈┈ Estado Vital ┈┈┈┈ ୨୧**\n` +
                `❤️ **Salud:** \`${vActual.toFixed(1)} / ${vMax}\`\n` +
                `> ${barraSalud}\n\n` +
                `**୨୧ ┈┈┈┈ Información ┈┈┈┈ ୨୧**\n` +
                `${emojis.pinkstars} **Nombre:** \`${member.displayName}\`\n` +
                `${emojis.star} **Carisma:** \`${data.rep || 0} Rep\`\n` +
                `${emojis.exclamation} **Muertes:** \`${data.deadCount || 0}\` (Mina/Pesca)\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            );

        // --- 📄 PÁGINA 2: STATUS (ESTADÍSTICAS) ---
        const statsEmbed = () => new EmbedBuilder()
            .setTitle(`${emojis.star} ‧₊˚ Status Rockstar ˚₊‧ ${emojis.star}`)
            .setColor('#CDB4DB')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(`**୨୧ ┈┈┈┈ Actividad ┈┈┈┈ ୨୧**\n\n` +
                `${emojis.heart} **Acciones:** \`${profileDB?.ActionCount || 0}\` interacciones\n` +
                `${emojis.pinkstars} **Mensajes:** \`${profileDB?.MessageCount || 0}\` enviados\n` +
                `${emojis.star} **Nivel Actual:** \`${profileDB?.Level || 1}\` (Neko Rank)\n\n` +
                `> *“Tus acciones resuenan en el vacío...”*\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`);

        // --- 📄 PÁGINA 3: HAREM ---
        const haremEmbed = () => {
            const maxSlots = data.maxHaremSlots || 5; 
            const list = data.harem?.map((m, i) => `${emojis.pinkstars} **${i+1}.** <@${m.id}>`).join('\n') || "*Harem solitario...* ☁️";
            return new EmbedBuilder()
                .setTitle(`${emojis.star} ‧₊˚ Harem ˚₊‧ ${emojis.star}`)
                .setColor('#FF9AA2')
                .setDescription(`${list}\n\n${emojis.heart} **Espacios:** \`${data.harem?.length || 0} / ${maxSlots}\``);
        };

        const response = await input.reply({ embeds: [mainEmbed()], components: [row] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== authorId) return i.reply({ content: `${emojis.exclamation} ¡Solo quien solicitó este perfil puede navegar!`, ephemeral: true });
            
            if (i.customId === 'main') await i.update({ embeds: [mainEmbed()] });
            if (i.customId === 'stats') await i.update({ embeds: [statsEmbed()] });
            if (i.customId === 'harem') await i.update({ embeds: [haremEmbed()] });
            if (i.customId === 'exit') {
                await i.update({ content: `${emojis.pinkbow} *Cerrando perfil...*`, embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2000);
            }
        });
    }
};
