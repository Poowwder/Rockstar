const { 
    EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');
const { getUserData } = require('../economyManager.js');
const MarriageManager = require('../marriageManager.js');

module.exports = {
    name: 'profile',
    aliases: ['p', 'perfil'],
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('🎀 Mira tu perfil detallado o el de otra persona')
        .addUserOption(opt => opt.setName('u').setDescription('Usuario')),

    async execute(input) {
        const isSlash = !!input.user;
        const authorId = isSlash ? input.user.id : input.author.id;
        const target = isSlash ? (input.options.getUser('u') || input.user) : (input.mentions.users.first() || input.author);
        const member = input.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);

        // --- FILA DE BOTONES ROCKSTAR ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main').setLabel('🎀 Perfil').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('stats').setLabel('📊 Stats').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('equip').setLabel('🛠️ Equipo').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('harem').setLabel('💍 Harem').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exit').setLabel('✖️').setStyle(ButtonStyle.Danger)
        );

        // --- 1. EMBED PRINCIPAL (PERFIL) ---
        const mainEmbed = () => new EmbedBuilder()
            .setTitle(`🤍 ‧₊˚ Perfil Rockstar: ${member.displayName} ˚₊‧ 🤍`)
            .setColor('#FFB6C1')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                `*“${data.mood || "Brillando con luz propia..."}”* ✨\n\n` +
                `**୨୧ ┈┈┈┈ Información ┈┈┈┈ ୨୧**\n` +
                `🌸 **Nombre:** \`${member.displayName}\`\n` +
                `✨ **Carisma:** \`${data.rep || 0} Rep\`\n` +
                `💀 **Muertes:** \`${data.deadCount || 0}\` (Mine/Fish)\n` +
                `📅 **Registro:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>\n\n` +
                `**୨୧ ┈┈┈┈ Colección ┈┈┈┈ ୨୧**\n` +
                `🐾 **Mascotas:**\n` +
                `╰┈➤ ${data.pets?.length > 0 ? data.pets.join(', ') : '*Aún no tienes mascotas...* ☁️'}\n\n` +
                `**୨୧ ┈┈┈┈ Profesiones ┈┈┈┈ ୨୧**\n` +
                `💼 **Trabajo:** \`${data.job || 'Sin profesión actualmente'}\`\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            )
            .setFooter({ text: `Solicitado por ${input.member.displayName} ♡` });

        // --- 2. EMBED DE ESTADÍSTICAS (ACCIONES Y REACCIONES) ---
        const statsEmbed = () => new EmbedBuilder()
            .setTitle(`📊 ‧₊˚ Estadísticas de Actividad ˚₊‧ 📊`)
            .setColor('#CDB4DB')
            .setDescription(
                `**୨୧ ┈┈┈┈ Interacciones ┈┈┈┈ ୨୧**\n` +
                `🫂 **Hugs:** \`${data.actionsReceived?.hug || 0}\` ‧ 🤚 **Pats:** \`${data.actionsReceived?.pat || 0}\`\n` +
                `💥 **Sapes:** \`${data.actionsReceived?.slap || 0}\` ‧ 🔨 **Bonks:** \`${data.actionsReceived?.bonk || 0}\`\n\n` +
                `**୨୧ ┈┈┈┈ Actividad General ┈┈┈┈ ୨୧**\n` +
                `🎬 **Anime:** \`${data.stats?.anime || 0}\` ‧ 🎰 **Slots:** \`${data.stats?.slots || 0}\`\n` +
                `📜 **Quests:** \`${data.stats?.quests || 0}\` ‧ 🎁 **Loots:** \`${data.stats?.loots || 0}\`\n` +
                `✨ **Action:** \`${data.stats?.action || 0}\` ‧ 🎭 **Reaction:** \`${data.stats?.reaction || 0}\`\n` +
                `💀 **Deaths:** \`${data.deadCount || 0}\` ‧ ✨ **Charisma:** \`${data.rep || 0}\`\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            );

        // --- 3. EMBED DE EQUIPO/HERRAMIENTAS ---
        const equipEmbed = () => new EmbedBuilder()
            .setTitle(`🎒 ‧₊˚ Mochila de Herramientas ˚₊‧ 🎒`)
            .setColor('#B2E2F2')
            .setDescription(
                `**୨୧ ┈┈┈┈ Herramientas ┈┈┈┈ ୨୧**\n\n` +
                (data.tools?.length > 0 
                    ? data.tools.map(t => `╰┈➤ 🛠️ **${t}**`).join('\n')
                    : `*Actualmente no tienes herramientas...* ☁️\n¡Visita la boutique para equiparte!`) +
                `\n\n**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            );

        // --- 4. EMBED DE HAREM (DINÁMICO POR RANGO) ---
        const haremEmbed = async () => {
            const max = await MarriageManager.getMaxSlots(target.id);
            const haremList = data.harem?.map((m, i) => `✨ **${i+1}.** <@${m.id}> (<t:${Math.floor(m.time/1000)}:R>)`).join('\n') || "*Harem solitario por ahora...* ☁️";
            const emoji = data.premiumType === 'bimestral' ? '💎' : (data.premiumType === 'mensual' ? '🎀' : '🌸');

            return new EmbedBuilder()
                .setTitle(`${emoji} ‧₊˚ Corazón & Harem ˚₊‧ ${emoji}`)
                .setColor('#FF9AA2')
                .setDescription(
                    `**୨୧ ┈┈┈┈ Mi Harem Rockstar ┈┈┈┈ ୨୧**\n\n` +
                    `${haremList}\n\n` +
                    `✨ **Espacios:** \`${data.harem?.length || 0} / ${max}\`\n` +
                    `🎀 **Rango:** \`${data.premiumType || 'Normal'}\`\n` +
                    `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
                );
        };

        // ENVIAR RESPUESTA INICIAL
        const response = await input.reply({ 
            embeds: [mainEmbed()], 
            components: [row] 
        });

        // --- COLECTOR DE INTERACCIONES ---
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== authorId) return i.reply({ content: '❌ ¡Solo la dueña del comando puede navegar aquí!', ephemeral: true });

            if (i.customId === 'main') await i.update({ embeds: [mainEmbed()] });
            if (i.customId === 'stats') await i.update({ embeds: [statsEmbed()] });
            if (i.customId === 'equip') await i.update({ embeds: [equipEmbed()] });
            if (i.customId === 'harem') await i.update({ embeds: [await haremEmbed()] });
            if (i.customId === 'exit') {
                await i.update({ content: '╰┈➤ 🌸 *Cerrando perfil... ¡Vuelve pronto, reina!* ✨', embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2000);
                collector.stop();
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                row.components.forEach(c => c.setDisabled(true));
                response.edit({ components: [row] }).catch(() => {});
            }
        });
    }
};