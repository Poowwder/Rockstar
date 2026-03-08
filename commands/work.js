const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Elige un empleo para ganar flores'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const data = await getUserData(userId);
        const now = Date.now();
        const cooldown = 3600000; // 1 hora de cooldown

        if (now - (data.lastWork || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (now - data.lastWork)) / 60000);
            return interaction.reply({ 
                content: `⏳ Estás cansado/a. Vuelve en **${restante} minutos** para trabajar de nuevo.`, 
                ephemeral: true 
            });
        }

        // --- MENÚ DE SELECCIÓN DE TRABAJOS ---
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_work')
                .setPlaceholder('🌸 Elige tu oficio de hoy...')
                .addOptions([
                    {
                        label: 'Jardinero de Cerezos',
                        description: 'Ganas poco, pero es seguro. (500 - 800 🌸)',
                        value: 'jardinero',
                        emoji: '🎋'
                    },
                    {
                        label: 'Chef de Ramen',
                        description: 'Trabajo duro, paga media. (1000 - 1500 🌸)',
                        value: 'chef',
                        emoji: '🍜'
                    },
                    {
                        label: 'Ídolo de K-Pop',
                        description: '¡Mucho riesgo, mucha paga! (2000 - 4000 🌸)',
                        value: 'idol',
                        emoji: '🎤'
                    }
                ])
        );

        const response = await interaction.reply({
            content: '✨ **Centro de Empleo Rockstar**\n¿En qué te gustaría trabajar hoy?',
            components: [menu]
        });

        // Colector para la selección
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 30000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "❌ Esta no es tu oferta de trabajo.", ephemeral: true });

            let ganancia = 0;
            let mensaje = "";
            const seleccion = i.values[0];

            if (seleccion === 'jardinero') {
                ganancia = Math.floor(Math.random() * (800 - 500 + 1)) + 500;
                mensaje = "Has podado los cerezos con éxito. El jardín luce hermoso. 🎋";
            } else if (seleccion === 'chef') {
                ganancia = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
                mensaje = "¡Serviste 50 tazones de ramen caliente! Tus manos duelen pero valió la pena. 🍜";
            } else if (seleccion === 'idol') {
                // Probabilidad de éxito para el Idol (80%)
                if (Math.random() > 0.2) {
                    ganancia = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
                    mensaje = "✨ ¡Tu concierto fue un éxito total! Las fans te lanzaron flores y dinero. 🎤";
                } else {
                    ganancia = 0;
                    mensaje = "❌ Tuviste un desafortunado error en la coreografía y la empresa no te pagó nada hoy... F.";
                }
            }

            data.wallet += ganancia;
            data.lastWork = Date.now();
            await updateUserData(userId, data);

            const workEmbed = new EmbedBuilder()
                .setTitle('💼 Jornada Terminada')
                .setColor('#FFB6C1')
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${mensaje}\n\n💰 **Paga recibida:** \`${ganancia} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
                .setFooter({ text: `Balance actual: ${data.wallet} 🌸` });

            await i.update({ content: '', embeds: [workEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: '❌ La oferta de trabajo expiró por inactividad.', components: [] });
            }
        });
    }
};