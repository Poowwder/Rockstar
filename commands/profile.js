const { 
    EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ComponentType 
} = require('discord.js');
const { getUserData } = require('../economyManager.js');
const MarriageManager = require('../marriageManager.js');

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
        const member = input.guild.members.cache.get(target.id);
        const data = await getUserData(target.id);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main').setLabel('🎀 Perfil').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('stats').setLabel('📊 Stats').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('harem').setLabel('💍 Harem').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exit').setLabel('✖️').setStyle(ButtonStyle.Danger)
        );

        const mainEmbed = () => new EmbedBuilder()
            .setTitle(`🤍 ‧₊˚ Perfil Rockstar: ${member.displayName} ˚₊‧ 🤍`)
            .setColor('#FFB6C1')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `*“${data.mood || "Brillando con luz propia..."}”* ✨\n\n` +
                `**୨୧ ┈┈┈┈ Información ┈┈┈┈ ୨୧**\n` +
                `🌸 **Nombre:** \`${member.displayName}\`\n` +
                `✨ **Carisma:** \`${data.rep || 0} Rep\`\n` +
                `💀 **Muertes:** \`${data.deadCount || 0}\` (Mine/Fish)\n` +
                `📅 **Registro:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>\n\n` +
                `🐾 **Mascotas:**\n╰┈➤ ${data.pets?.length > 0 ? data.pets.join(', ') : '*Sin mascotas...* ☁️'}\n\n` +
                `💼 **Trabajo:** \`${data.job || 'Sin profesión actualmente'}\`\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            );

        const statsEmbed = () => new EmbedBuilder()
            .setTitle(`📊 ‧₊˚ Estadísticas Rockstar ˚₊‧ 📊`)
            .setColor('#CDB4DB')
            .setDescription(
                `**୨୧ ┈┈┈┈ Interacciones ┈┈┈┈ ୨୧**\n` +
                `🫂 **Hugs:** \`${data.actionsReceived?.hug || 0}\` ‧ 🤚 **Pats:** \`${data.actionsReceived?.pat || 0}\`\n` +
                `💥 **Sapes:** \`${data.actionsReceived?.slap || 0}\` ‧ 🔨 **Bonks:** \`${data.actionsReceived?.bonk || 0}\`\n\n` +
                `**୨୧ ┈┈┈┈ Actividad ┈┈┈┈ ୨୧**\n` +
                `🎰 **Slots:** \`${data.stats?.slots || 0}\` ‧ 📜 **Quests:** \`${data.stats?.quests || 0}\`\n` +
                `🎁 **Loots:** \`${data.stats?.loots || 0}\` ‧ ☠️ **Deaths:** \`${data.deadCount || 0}\`\n` +
                `✨ **Action:** \`${data.stats?.action || 0}\` ‧ 🎭 **Reaction:** \`${data.stats?.reaction || 0}\`\n\n` +
                `**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`
            );

        const haremEmbed = async () => {
            const max = await MarriageManager.getMaxSlots(target.id);
            const list = data.harem?.map((m, i) => `✨ **${i+1}.** <@${m.id}> (<t:${Math.floor(m.time/1000)}:R>)`).join('\n') || "*Harem solitario...* ☁️";
            const emoji = data.premiumType === 'bimestral' ? '💎' : (data.premiumType === 'mensual' ? '🎀' : '🌸');

            return new EmbedBuilder()
                .setTitle(`${emoji} ‧₊˚ Mi Harem Rockstar ˚₊‧ ${emoji}`)
                .setColor('#FF9AA2')
                .setDescription(`**୨୧ ┈┈┈┈ Lista de Corazones ┈┈┈┈ ୨୧**\n\n${list}\n\n✨ **Espacios:** \`${data.harem?.length || 0} / ${max}\`\n🎀 **Rango:** \`${data.premiumType || 'Normal'}\`\n**୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧**`);
        };

        const response = await input.reply({ embeds: [mainEmbed()], components: [row] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== authorId) return i.reply({ content: '❌ ¡Solo la dueña puede navegar!', ephemeral: true });
            if (i.customId === 'main') await i.update({ embeds: [mainEmbed()] });
            if (i.customId === 'stats') await i.update({ embeds: [statsEmbed()] });
            if (i.customId === 'harem') await i.update({ embeds: [await haremEmbed()] });
            if (i.customId === 'exit') {
                await i.update({ content: '╰┈➤ 🌸 *Cerrando perfil...* ✨', embeds: [], components: [] });
                setTimeout(() => response.delete().catch(() => {}), 2000);
            }
        });
    }
};