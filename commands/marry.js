const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

module.exports = {
    name: 'marry',
    aliases: ['propose', 'divorce'],
    category: 'harem',
    description: '💍 Gestiona tus vínculos y alianzas en las sombras.',
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Gestiona tus vínculos y alianzas')
        .addSubcommand(s => 
            s.setName('propose')
             .setDescription('Propón una alianza a alguien')
             .addUserOption(o => o.setName('u').setDescription('Tu futura pareja').setRequired(true)))
        .addSubcommand(s => 
            s.setName('divorce')
             .setDescription('Rompe el vínculo con alguien')
             .addUserOption(o => o.setName('u').setDescription('Usuario a remover').setRequired(true))),

    async execute(input, args) {
        // ✅ FIX: Corrección de detección híbrida
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        let sub = isSlash ? input.options.getSubcommand() : (args[0] || 'propose');
        if (!isSlash && input.mentions.users.first() && !['propose', 'divorce'].includes(args[0])) {
            sub = 'propose';
        }

        const target = isSlash ? input.options.getUser('u') : input.mentions.users.first();

        // --- ✨ MOTOR DE EMOJIS AL AZAR ---
        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '✨';
        };
        
        // --- 💎 OBTENER DATOS Y CALCULAR SLOTS ---
        let data = await getUserData(user.id);
        if (!data) return input.reply(`╰┈➤ ❌ Las sombras no pudieron encontrar tu expediente.`);

        let maxSlots = 10;
        const premium = (data.premiumType || 'none').toLowerCase();
        if (premium === 'pro' || premium === 'mensual') maxSlots = 15;
        if (premium === 'ultra' || premium === 'bimestral') maxSlots = 20;

        // Prevención por si la DB está vacía
        if (!data.harem) data.harem = [];

        // --- 💍 LÓGICA DE PROPUESTA ---
        if (sub === 'propose') {
            if (!target || target.id === user.id) return input.reply(`╰┈➤ ❌ No puedes forjar un vínculo contigo mismo o con el aire.`);
            if (target.bot) return input.reply(`╰┈➤ 🤖 Los entes artificiales no tienen alma para formar alianzas.`);
            
            if (data.harem.length >= maxSlots) {
                return input.reply(`╰┈➤ ❌ **Límite alcanzado.** Tu capacidad actual es de \`[${maxSlots}]\` espacios.`);
            }
            
            if (data.harem.some(m => m.id === target.id)) return input.reply(`╰┈➤ 💍 Ese alma ya pertenece a tu harén.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('yes').setLabel('Aceptar Alianza').setStyle(ButtonStyle.Success).setEmoji(getE()),
                new ButtonBuilder().setCustomId('no').setLabel('Rechazar').setStyle(ButtonStyle.Danger).setEmoji('✖️')
            );

            const proposeEmbed = new EmbedBuilder()
                .setTitle(`${getE()} Pacto de Sombras y Alianzas ${getE()}`)
                .setColor('#1a1a1a')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `${getE()} **<@${target.id}>**, las sombras han susurrado tu nombre.\n` +
                    `> **${user.username}** te ofrece formar un vínculo eterno y unirte a su harén.\n\n` +
                    `${getE()} *¿Aceptarías esta unión?*\n\n` +
                    `╰┈➤ **Espacios de ${user.username}:** \`[${data.harem.length + 1} / ${maxSlots}]\``
                )
                .setFooter({ text: `${getE()} Rockstar Alianzas ${getE()}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            const msg = await input.reply({ embeds: [proposeEmbed], components: [row] });
            
            const filter = i => i.user.id === target.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async i => {
                if (i.customId === 'yes') {
                    // Guardamos ID, nombre y fecha
                    data.harem.push({ id: target.id, username: target.username, time: Date.now() });
                    await updateUserData(user.id, { harem: data.harem });

                    const weddingEmbed = new EmbedBuilder()
                        .setTitle(`${getE()} Vínculo Sellado ${getE()}`)
                        .setColor('#1a1a1a')
                        .setImage('https://i.pinimg.com/originals/44/21/df/4421df09315998a1351543719003f671.gif')
                        .setDescription(`> ${getE()} **Las sombras son testigos.**\n> <@${target.id}> ahora forma parte oficial del harén de **${user.username}**.`)
                        .setFooter({ text: `${getE()} Nuevo Vínculo ${getE()}` })
                        .setTimestamp();
                    
                    await i.update({ embeds: [weddingEmbed], components: [] });
                } else {
                    await i.update({ content: `╰┈➤ 💔 **El vínculo se ha roto antes de empezar.** La propuesta ha sido rechazada.`, embeds: [], components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    msg.edit({ content: `╰┈➤ ⏳ *El tiempo se agotó y el anillo se perdió en la oscuridad...*`, components: [], embeds: [] }).catch(() => {});
                }
            });
        }

        // --- 💔 LÓGICA DE DIVORCIO ---
        if (sub === 'divorce') {
            if (!target) return input.reply(`╰┈➤ ❌ Menciona el alma que deseas desterrar de tu harén.`);
            
            if (!data.harem.some(m => m.id === target.id)) {
                return input.reply(`╰┈➤ ❌ Esa persona no pertenece a tus alianzas.`);
            }

            data.harem = data.harem.filter(m => m.id !== target.id);
            await updateUserData(user.id, { harem: data.harem });

            return input.reply(`╰┈➤ 💔 El vínculo con **${target.username}** se ha cortado. Las sombras reclaman su espacio... ¡Next! ✨`);
        }
    }
};
