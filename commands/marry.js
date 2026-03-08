const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const MarriageManager = require('../marriageManager.js');

module.exports = {
    name: 'marry',
    category: 'harem',
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Gestiona tu Harem Rockstar')
        .addSubcommand(s => 
            s.setName('propose')
             .setDescription('Propón matrimonio a alguien')
             .addUserOption(o => o.setName('u').setDescription('Tu futura pareja').setRequired(true)))
        .addSubcommand(s => 
            s.setName('divorce')
             .setDescription('Eliminar a alguien de tu harem')
             .addUserOption(o => o.setName('u').setDescription('Usuario a remover').setRequired(true))),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const sub = isSlash ? input.options.getSubcommand() : input.content.split(' ')[1];
        const target = isSlash ? input.options.getUser('u') : input.mentions.users.first();
        
        let data = await getUserData(user.id);
        if (!data.harem) data.harem = [];
        const maxSlots = await MarriageManager.getMaxSlots(user.id);

        if (sub === 'propose') {
            if (!target || target.id === user.id) return input.reply("╰┈➤ ❌ **¡Linda!** Usuario no válido.");
            if (data.harem.length >= maxSlots) return input.reply(`╰┈➤ ❌ **Límite alcanzado.** Capacidad actual: \`${maxSlots}\` espacios.`);
            if (data.harem.some(m => m.id === target.id)) return input.reply("╰┈➤ 💍 Ya está en tu harem.");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('yes').setLabel('¡Acepto! 💍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('no').setLabel('Rechazar 💔').setStyle(ButtonStyle.Danger)
            );

            const proposeEmbed = new EmbedBuilder()
                .setTitle(`‧₊˚ 💍 Propuesta Rockstar ˚₊‧`)
                .setColor('#FFB6C1')
                .setDescription(`✨ **<@${target.id}>**, **${user.username}** te ha propuesto ser parte de su harem.\n\n**¿Aceptarías esta unión brillante?** 🎀\n\n*Espacios: \`${data.harem.length + 1}/${maxSlots}\`*`);

            const msg = await input.reply({ embeds: [proposeEmbed], components: [row] });
            const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === target.id, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'yes') {
                    data.harem.push({ id: target.id, time: Date.now() });
                    await updateUserData(user.id, data);
                    const weddingEmbed = new EmbedBuilder()
                        .setTitle(`‧₊˚ ✨ ¡Unión Confirmada! ✨ ˚₊‧`)
                        .setColor('#FFB6C1')
                        .setImage('https://i.pinimg.com/originals/44/21/df/4421df09315998a1351543719003f671.gif')
                        .setDescription(`🎊 **¡Felicidades!** <@${target.id}> ahora es parte del harem de **${user.username}**.`);
                    await i.update({ embeds: [weddingEmbed], components: [] });
                } else {
                    await i.update({ content: "💔 Propuesta rechazada.", embeds: [], components: [] });
                }
            });
        }

        if (sub === 'divorce') {
            if (!target) return input.reply("╰┈➤ 🌸 Menciona a quién remover.");
            data.harem = data.harem.filter(m => m.id !== target.id);
            await updateUserData(user.id, data);
            return input.reply(`╰┈➤ 💔 **${target.username}** ha salido de tu harem.`);
        }
    }
};