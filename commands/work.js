const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'work',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Elige un empleo para ganar flores 🌸'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const member = input.member;
        const userId = user.id;

        const data = await getUserData(userId);
        const now = Date.now();
        const cooldown = 3600000;

        if (now - (data.lastWork || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (now - data.lastWork)) / 60000);
            return input.reply({ 
                content: `⏳ **Hey, ${member.displayName}...** estás cansada. Vuelve en **${restante} minutos** para trabajar.`, 
                ephemeral: true 
            });
        }

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_work')
                .setPlaceholder('🌸 Elige tu oficio de hoy...')
                .addOptions([
                    { label: 'Jardinero de Cerezos', description: 'Ganas poco, pero es seguro. (500-800)', value: 'jardinero', emoji: '🎋' },
                    { label: 'Chef de Ramen', description: 'Trabajo duro, paga media. (1000-1500)', value: 'chef', emoji: '🍜' },
                    { label: 'Ídolo de K-Pop', description: '¡Mucho riesgo, mucha paga! (2000-4000)', value: 'idol', emoji: '🎤' }
                ])
        );

        const response = await input.reply({
            content: `✨ **Centro de Empleo Rockstar**\n¿En qué te gustaría trabajar hoy, ${member.displayName}?`,
            components: [menu],
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 30000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "❌ Esta no es tu oferta.", ephemeral: true });

            let ganancia = 0;
            let mensaje = "";
            const seleccion = i.values[0];

            if (seleccion === 'jardinero') {
                ganancia = Math.floor(Math.random() * (800 - 500 + 1)) + 500;
                mensaje = "╰┈➤ Has podado los cerezos con éxito. El jardín luce hermoso. 🎋";
            } else if (seleccion === 'chef') {
                ganancia = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
                mensaje = "╰┈➤ ¡Serviste 50 tazones de ramen! Tus manos duelen pero valió la pena. 🍜";
            } else if (seleccion === 'idol') {
                if (Math.random() > 0.2) {
                    ganancia = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
                    mensaje = "╰┈➤ ✨ ¡Tu concierto fue un éxito total! Las fans te lanzaron flores. 🎤";
                } else {
                    ganancia = 0;
                    mensaje = "╰┈➤ ❌ Tuviste un error en la coreografía y no hubo paga hoy... F.";
                }
            }

            data.wallet += ganancia;
            data.lastWork = Date.now();
            await updateUserData(userId, data);

            const workEmbed = new EmbedBuilder()
                .setTitle('💼 Jornada Terminada')
                .setColor('#FFB6C1')
                .setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif')
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${mensaje}\n\n💰 **Paga recibida:** \`${ganancia} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
                .setTimestamp()
                .setFooter({ text: `Trabajo de: ${member.displayName}`, iconURL: user.displayAvatarURL() });

            await i.update({ content: '', embeds: [workEmbed], components: [] });
            collector.stop();
        });
    }
};