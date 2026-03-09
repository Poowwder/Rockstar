const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

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

        // --- 💎 CONFIGURACIÓN DE TIEMPOS (COOLDOWN) ---
        let cooldown = 3600000; // 1 hora (Normal)
        let multiplicador = 1;  
        let statusEmoji = "🌸";

        if (data.premiumType === 'mensual') {
            cooldown = 1800000; // 30 minutos ✨
            multiplicador = 1.2; 
            statusEmoji = "💎";
        } else if (data.premiumType === 'bimestral') {
            cooldown = 0; // ¡SIN COOLDOWN! 🔥👑
            multiplicador = 1.5; 
            statusEmoji = "👑";
        }

        // --- ⏳ VERIFICAR COOLDOWN ---
        // Solo verificamos si el cooldown es mayor a 0 (osea, si no es Bimestral)
        if (cooldown > 0 && now - (data.lastWork || 0) < cooldown) {
            const restanteMs = cooldown - (now - data.lastWork);
            const minutos = Math.floor(restanteMs / 60000);
            const segundos = Math.floor((restanteMs % 60000) / 1000);

            return input.reply({ 
                content: `⏳ **Hey, ${member.displayName}...** estás cansada. Vuelve en **${minutos}m ${segundos}s** para trabajar.\n> *Tip: Los miembros Bimestrales no tienen espera. 👑*`, 
                ephemeral: true 
            });
        }

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_work')
                .setPlaceholder('🌸 Elige tu oficio de hoy...')
                .addOptions([
                    { label: 'Jardinero de Cerezos', description: 'Ganas poco (500-800)', value: 'jardinero', emoji: '🎋' },
                    { label: 'Chef de Ramen', description: 'Paga media (1000-1500)', value: 'chef', emoji: '🍜' },
                    { label: 'Ídolo de K-Pop', description: '¡Mucho riesgo, mucha paga! (2000-4000)', value: 'idol', emoji: '🎤' }
                ])
        );

        const response = await input.reply({
            content: `✨ **Centro de Empleo Rockstar** ${statusEmoji}\n¿En qué te gustaría trabajar hoy, ${member.displayName}?`,
            components: [menu],
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 30000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "❌ Esta no es tu oferta.", ephemeral: true });

            let gananciaBase = 0;
            let mensaje = "";
            const seleccion = i.values[0];

            if (seleccion === 'jardinero') {
                gananciaBase = Math.floor(Math.random() * (800 - 500 + 1)) + 500;
                mensaje = "╰┈➤ Has podado los cerezos con éxito. 🎋";
            } else if (seleccion === 'chef') {
                gananciaBase = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
                mensaje = "╰┈➤ ¡Cocinaste el mejor ramen de la ciudad! 🍜";
            } else if (seleccion === 'idol') {
                if (Math.random() > 0.2) {
                    gananciaBase = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
                    mensaje = "╰┈➤ ✨ ¡Tu concierto fue Sold Out! Las fans gritan tu nombre. 🎤";
                } else {
                    gananciaBase = 0;
                    mensaje = "╰┈➤ ❌ Te caíste en el escenario... hoy no hay paga. F.";
                }
            }

            // Aplicar los bonos que definimos arriba 🎀
            const gananciaFinal = Math.floor(gananciaBase * multiplicador);
            
            data.wallet += gananciaFinal;
            data.lastWork = Date.now();
            
            await updateUserData(userId, { wallet: data.wallet, lastWork: data.lastWork });

            const workEmbed = new EmbedBuilder()
                .setTitle(`${statusEmoji} Jornada Terminada ${statusEmoji}`)
                .setColor('#FFB6C1')
                .setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif')
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${mensaje}\n\n💰 **Paga:** \`${gananciaFinal} 🌸\`\n**Plan:** \`${data.premiumType.toUpperCase()}\`\n\n**Próximo turno:** ${cooldown === 0 ? '¡Ya mismo! 👑' : 'En espera ⏳'}\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
                .setFooter({ text: `Trabajadora: ${member.displayName}`, iconURL: user.displayAvatarURL() });

            await i.update({ content: '', embeds: [workEmbed], components: [] });
            collector.stop();
        });
    }
};