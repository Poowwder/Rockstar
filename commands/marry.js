const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

// --- 💾 MEMORIA TEMPORAL (Cooldowns y Pendientes) ---
const cooldowns = new Map();
const pendingRequests = new Set();

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
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        let sub = isSlash ? input.options.getSubcommand() : (args[0] || 'propose');
        if (!isSlash && input.mentions.users.first() && !['propose', 'divorce'].includes(args[0])) {
            sub = 'propose';
        }

        const target = isSlash ? input.options.getUser('u') : input.mentions.users.first();

        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '✨';
        };

        // --- ⏳ SISTEMA DE COOLDOWN (5 MINUTOS) ---
        const cooldownTime = 5 * 60 * 1000;
        const now = Date.now();
        if (cooldowns.has(user.id)) {
            const expirationTime = cooldowns.get(user.id) + cooldownTime;
            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000 / 60);
                return input.reply({ content: `╰┈➤ ${getE()} **Paciencia.** Las sombras necesitan tiempo para otro ritual. Regresa en \`${timeLeft}\` minutos.`, ephemeral: true });
            }
        }
        
        let data = await getUserData(user.id);
        if (!data.harem) data.harem = [];

        // --- 💍 LÓGICA DE PROPUESTA ---
        if (sub === 'propose') {
            if (!target || target.id === user.id) return input.reply(`╰┈➤ ${getE()} No puedes forjar un vínculo contigo mismo.`);
            if (target.bot) return input.reply(`╰┈➤ ${getE()} Los entes artificiales no tienen alma.`);
            
            // Verificación de Petición Pendiente
            const requestID = `${user.id}-${target.id}`;
            if (pendingRequests.has(requestID)) {
                return input.reply({ content: `╰┈➤ ${getE()} **Espera.** Ya tienes una propuesta enviada a esta persona que aún no ha expirado.`, ephemeral: true });
            }

            if (data.harem.some(m => m.id === target.id)) return input.reply(`╰┈➤ ${getE()} Este alma ya está bajo tu protección.`);

            let maxSlots = (data.premiumType === 'pro' || data.premiumType === 'mensual') ? 15 : (data.premiumType === 'ultra' || data.premiumType === 'bimestral' ? 20 : 10);
            if (data.harem.length >= maxSlots) return input.reply(`╰┈➤ ${getE()} **Límite alcanzado.** Capacidad actual: \`[${maxSlots}]\`.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('yes').setLabel(`${getE()} Aceptar`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('no').setLabel(`${getE()} Rechazar`).setStyle(ButtonStyle.Danger)
            );

            const proposeEmbed = new EmbedBuilder()
                .setTitle(`${getE()} Pacto de Alianza ${getE()}`)
                .setColor('#1a1a1a')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `${getE()} **<@${target.id}>**, alguien te observa.\n` +
                    `> **${user.username}** te ofrece un lugar en su harén eterno.\n\n` +
                    `${getE()} *¿Aceptarías sellar este vínculo?*`
                )
                .setFooter({ text: `Rockstar Alianzas` })
                .setTimestamp();

            const msg = await input.reply({ embeds: [proposeEmbed], components: [row], fetchReply: true });
            
            pendingRequests.add(requestID); // Marcamos como pendiente

            const filter = i => i.user.id === target.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                pendingRequests.delete(requestID); // Limpiamos al responder
                if (i.customId === 'yes') {
                    data.harem.push({ id: target.id, username: target.username, time: Date.now() });
                    await updateUserData(user.id, { harem: data.harem });
                    cooldowns.set(user.id, now); // Activamos cooldown solo si acepta

                    const weddingEmbed = new EmbedBuilder()
                        .setTitle(`${getE()} Vínculo Sellado ${getE()}`)
                        .setColor('#1a1a1a')
                        .setImage('https://i.pinimg.com/originals/44/21/df/4421df09315998a1351543719003f671.gif')
                        .setDescription(`> ${getE()} **Alianza confirmada.**\n> <@${target.id}> ahora pertenece al harén de **${user.username}**.`)
                        .setFooter({ text: `Protocolo de Unión Rockstar` })
                        .setTimestamp();
                    
                    await i.update({ embeds: [weddingEmbed], components: [] });
                } else {
                    await i.update({ content: `╰┈➤ ${getE()} 💔 **Alianza rechazada.** El rastro de esta propuesta se desvanece...`, embeds: [], components: [] });
                }
            });

            collector.on('end', collected => {
                pendingRequests.delete(requestID); // Limpiamos si expira
                if (collected.size === 0) {
                    msg.edit({ content: `╰┈➤ ${getE()} ⏳ *El silencio fue la respuesta. Propuesta expirada.*`, components: [], embeds: [] }).catch(() => {});
                }
            });
        }

        // --- 💔 LÓGICA DE DIVORCIO ---
        if (sub === 'divorce') {
            if (!target) return input.reply(`╰┈➤ ${getE()} Menciona el alma que deseas desterrar.`);
            
            if (!data.harem.some(m => m.id === target.id)) return input.reply(`╰┈➤ ${getE()} Esa persona no está en tu harén.`);

            data.harem = data.harem.filter(m => m.id !== target.id);
            await updateUserData(user.id, { harem: data.harem });

            const divorceEmbed = new EmbedBuilder()
                .setTitle(`${getE()} Vínculo Quebrado ${getE()}`)
                .setColor('#1a1a1a')
                .setImage('https://i.pinimg.com/originals/70/41/50/70415039a51800684f0490b83b3e8e2c.gif')
                .setDescription(`> ${getE()} **Se ha terminado.**\n> El alma de **${target.username}** ha sido expulsada del harén de **${user.username}**.`)
                .setFooter({ text: `Protocolo de Ruptura Rockstar` })
                .setTimestamp();

            return input.reply({ embeds: [divorceEmbed] });
        }
    }
};
