const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const MarriageManager = require('../marriageManager.js');

module.exports = {
    name: 'marry',
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Añade un corazón a tu Harem Rockstar')
        .addSubcommand(s => s.setName('propose').setDescription('Haz la gran pregunta ✨').addUserOption(o => o.setName('u').setRequired(true).setDescription('Tu futura pareja')))
        .addSubcommand(s => s.setName('divorce').setDescription('Libera un espacio').addUserOption(o => o.setName('u').setRequired(true).setDescription('Usuario a remover'))),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const sub = isSlash ? input.options.getSubcommand() : args[0]?.toLowerCase();
        const target = isSlash ? input.options.getUser('u') : input.mentions.users.first();
        
        let data = await getUserData(user.id);
        if (!data.harem) data.harem = [];
        const maxSlots = await MarriageManager.getMaxSlots(user.id);

        if (sub === 'propose') {
            if (!target || target.id === user.id) return input.reply("╰┈➤ 🌸 **¡Holi!** Necesitas elegir a alguien que no seas tú. ✨");
            if (data.harem.length >= maxSlots) return input.reply(`╰┈➤ ❌ **¡Corazón lleno!** Tu rango actual permite \`${maxSlots}\` espacios. 🎀`);
            if (data.harem.some(m => m.id === target.id)) return input.reply("╰┈➤ 💍 **¡Ya es tuyo!** Esa persona ya brilla en tu harem. ✨");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('yes').setLabel('¡Acepto! 💍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('no').setLabel('Rechazar 💔').setStyle(ButtonStyle.Danger)
            );

            const proposeEmbed = new EmbedBuilder()
                .setTitle(`‧₊˚ 💍 Una Propuesta Rockstar ˚₊‧`)
                .setColor('#FFB6C1')
                .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
                .setDescription(`✨ **<@${target.id}>**, **${user.username}** te ha elegido para su harem.\n\n**¿Aceptarías ser parte de su colección de corazones?** 🎀\n\n*Espacios de ${user.username}: \`${data.harem.length + 1}/${maxSlots}\`*\n\n** ୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧ **`);

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
                        .setDescription(`🎊 **¡Felicidades!** <@${target.id}> ahora pertenece al harem de **${user.username}**.\n\n** ୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧ **`);
                    await i.update({ embeds: [weddingEmbed], components: [] });
                } else {
                    await i.update({ content: "╰┈➤ 💔 **Oh no...** La propuesta ha sido rechazada. ✨", embeds: [], components: [] });
                }
            });
        }

        if (sub === 'divorce') {
            if (!target) return input.reply("╰┈➤ 🌸 Menciona a quién quieres dejar ir.");
            data.harem = data.harem.filter(m => m.id !== target.id);
            await updateUserData(user.id, data);
            return input.reply(`╰┈➤ 💔 **${target.username}** ya no es parte de tu harem. ¡Un espacio libre! ✨`);
        }
    }
};