const { 
    EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');
const { getUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 

module.exports = {
    name: 'profile',
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('🎀 Mira tu perfil detallado o el de otra persona')
        .addUserOption(opt => opt.setName('u').setDescription('Usuario a consultar')),

    async execute(input) {
        const isSlash = !!input.user;
        const authorId = isSlash ? input.user.id : input.author.id;
        const target = isSlash ? (input.options.getUser('u') || input.user) : (input.mentions.users.first() || input.author);
        const member = input.guild.members.cache.get(target.id) || { displayName: target.username };
        
        // --- ✨ EMOJIS ALEATORIOS DEL SERVIDOR ---
        const guildEmojis = input.guild.emojis.cache.filter(e => e.available);
        const rnd = () => guildEmojis.size > 0 ? guildEmojis.random().toString() : '✨';
        
        // --- 📂 EXTRACCIÓN DE DATOS ---
        const data = await getUserData(target.id);
        const profileDB = await UserProfile.findOne({ UserID: target.id, GuildID: input.guild.id });

        const OWNER_ID = '1134261491745493032'; 
        const isOwner = (target.id === OWNER_ID);
        
        let rankTitle = data.premiumType ? data.premiumType.toUpperCase() : "CIUDADANO REGULAR";
        if (isOwner) rankTitle = "𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆";

        // --- 🐱 COLECCIÓN DE NEKOS ---
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
            .join(' ⊹ '); 

        // --- ❤️ SISTEMA DE SALUD ---
        const vMax = 3;
        const vActual = data.health ?? 3;
        const filled = Math.round((Math.min(vActual / vMax, 1)) * 10);
        const barraSalud = "🌸".repeat(filled) + "🖤".repeat(10 - filled); 

        // --- 🔘 INTERFAZ DE BOTONES ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main').setEmoji(rnd()).setLabel('Expediente').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('harem').setEmoji(rnd()).setLabel('Vínculos').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exit').setEmoji('✖️').setStyle(ButtonStyle.Danger)
        );

        // --- 📄 PÁGINA 1: EXPEDIENTE PRINCIPAL ---
        const carismaReal = data.carisma || data.rep || 0; 

        const mainEmbed = () => new EmbedBuilder()
            .setColor('#1a1a1a')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `> ${rnd()} **Expediente Clasificado: ${member.displayName}**\n` +
                `> *“${data.mood || "Navegando entre las sombras..."}”*\n\n` +
                `╰┈➤ 💠 **Rango:** \`${rankTitle}\`\n` +
                `╰┈➤ ✨ **Carisma:** \`${carismaReal} Pts\`\n` +
                `╰┈➤ 💀 **Muertes:** \`${data.deadCount || 0}\`\n\n` +
                `**Estado Vital**\n` +
                `> ❤️ \`${vActual.toFixed(1)} / ${vMax}\`\n` +
                `> ${barraSalud}\n\n` +
                (visibleNekos ? `**Mascotas Acompañantes**\n> ${visibleNekos}\n` : "")
            )
            .setFooter({ text: `Base de Datos ⊹ Rockstar`, iconURL: target.displayAvatarURL() });

        // --- 📄 PÁGINA 2: VÍNCULOS (HAREM) ---
        const haremEmbed = () => {
            const maxSlots = data.maxHaremSlots || 5; 
            
            let list = "> *Caminando en soledad...* ☁️";
            if (data.harem && data.harem.length > 0) {
                list = data.harem.map((m, i) => {
                    const hId = typeof m === 'string' ? m : m.id;
                    const hUser = input.client.users.cache.get(hId);
                    const hName = hUser ? hUser.username : 'Usuario Desconocido';
                    return `╰┈➤ **${i+1}.** \`${hName}\``;
                }).join('\n');
            }

            return new EmbedBuilder()
                .setColor('#1a1a1a')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `> ${rnd()} **Red de Vínculos de ${member.displayName}**\n\n` +
                    `${list}\n\n` +
                    `**Espacios Ocupados:** \`${data.harem?.length || 0} / ${maxSlots}\``
                )
                .setFooter({ text: `Sistema de Harem ⊹ Rockstar`, iconURL: target.displayAvatarURL() });
        };

        const response = await input.reply({ embeds: [mainEmbed()], components: [row], fetchReply: true });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== authorId) return i.reply({ content: `❌ Este expediente no te pertenece.`, ephemeral: true });
            
            if (i.customId === 'main') await i.update({ embeds: [mainEmbed()] });
            if (i.customId === 'harem') await i.update({ embeds: [haremEmbed()] });
            if (i.customId === 'exit') {
                await i.update({ content: `> ${rnd()} *Cerrando expediente de ${member.displayName}...*`, embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2500);
            }
        });

        collector.on('end', () => {
            response.edit({ components: [] }).catch(() => {});
        });
    }
};
