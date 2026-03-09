const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

module.exports = {
    name: 'marry',
    aliases: ['propose', 'divorce'],
    category: 'harem',
    description: '💍 Gestiona tu Harem Rockstar',
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

    async execute(input, args) {
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        
        let sub = isSlash ? input.options.getSubcommand() : (args[0] || 'propose');
        if (!isSlash && input.mentions.users.first() && !['propose', 'divorce'].includes(args[0])) {
            sub = 'propose';
        }

        const target = isSlash ? input.options.getUser('u') : input.mentions.users.first();
        
        // --- 💎 OBTENER DATOS Y CALCULAR SLOTS ---
        let data = await getUserData(user.id);
        if (!data) return input.reply("🌸 Hubo un error al leer tu perfil, reina.");

        // Lógica de capacidades solicitada
        let maxSlots = 10; // Default: Normal
        if (data.premiumType === 'mensual') maxSlots = 15;
        if (data.premiumType === 'bimestral') maxSlots = 20;

        // --- 💍 LÓGICA DE PROPUESTA ---
        if (sub === 'propose') {
            if (!target || target.id === user.id) return input.reply("╰┈➤ ❌ **¡Linda!** Menciona a una persona válida.");
            if (target.bot) return input.reply("╰┈➤ 🤖 No puedes casarte con un bot, reina.");
            
            if (data.harem.length >= maxSlots) {
                return input.reply(`╰┈➤ ❌ **Límite alcanzado.** Tu capacidad actual es de \`${maxSlots}\` espacios. ✨`);
            }
            
            if (data.harem.some(m => m.id === target.id)) return input.reply("╰┈➤ 💍 Esa persona ya brilla en tu harem.");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('yes').setLabel('¡Acepto! 💍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('no').setLabel('Rechazar 💔').setStyle(ButtonStyle.Danger)
            );

            const proposeEmbed = new EmbedBuilder()
                .setTitle(`‧₊˚ 💍 Propuesta Rockstar ˚₊‧`)
                .setColor('#FFB6C1')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`✨ **<@${target.id}>**, **${user.username}** te ha propuesto ser parte de su harem.\n\n**¿Aceptarías esta unión brillante?** 🎀\n\n*Espacios: \`${data.harem.length + 1}/${maxSlots}\`*`);

            const msg = await input.reply({ embeds: [proposeEmbed], components: [row] });
            
            const filter = i => i.user.id === target.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async i => {
                if (i.customId === 'yes') {
                    // Guardamos ID, nombre y fecha
                    data.harem.push({ id: target.id, username: target.username, time: Date.now() });
                    await updateUserData(user.id, { harem: data.harem });

                    const weddingEmbed = new EmbedBuilder()
                        .setTitle(`‧₊˚ ✨ ¡Unión Confirmada! ✨ ˚₊‧`)
                        .setColor('#FFB6C1')
                        .setImage('https://i.pinimg.com/originals/44/21/df/4421df09315998a1351543719003f671.gif')
                        .setDescription(`🎊 **¡Felicidades!** <@${target.id}> ahora es parte oficial del harem de **${user.username}**.`);
                    
                    await i.update({ embeds: [weddingEmbed], components: [] });
                } else {
                    await i.update({ content: "💔 **Oh no...** La propuesta ha sido rechazada.", embeds: [], components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    msg.edit({ content: "⏰ Se acabó el tiempo, el anillo se perdió...", components: [], embeds: [] }).catch(() => {});
                }
            });
        }

        // --- 💔 LÓGICA DE DIVORCIO ---
        if (sub === 'divorce') {
            if (!target) return input.reply("╰┈➤ 🌸 Menciona a quién quieres remover de tu harem.");
            
            if (!data.harem.some(m => m.id === target.id)) {
                return input.reply("╰┈➤ ❌ Esa persona no está en tu harem, reina.");
            }

            data.harem = data.harem.filter(m => m.id !== target.id);
            await updateUserData(user.id, { harem: data.harem });

            return input.reply(`╰┈➤ 💔 **${target.username}** ha salido de tu harem. ¡Next! ✨`);
        }
    }
};