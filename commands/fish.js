const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const quests = require('../data/quests.json');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'fish',
    description: '🎣 Pesca materiales en las aguas.',
    category: 'economía',
    async execute(input) {
        const user = input.user || input.author;
        const e = () => getE(input.guild);
        
        let data = await getUserData(user.id);
        const inv = data.inventory || {};

        // --- 🗺️ ZONAS DE PESCA ---
        let zonas = [
            { id: 'cana_basica', zona: 'Orilla Tranquila', multis: 1, drop: 'hilo_reforzado', emj: '🧵' },
            { id: 'cana_reforzada', zona: 'Río Corriente', multis: 2, drop: 'cebo_profesional', emj: '🪱' },
            { id: 'cana_profesional', zona: 'Lago del Silencio', multis: 3, drop: 'escama_legendaria', emj: '🧜‍♀️' },
            { id: 'cana_legendaria', zona: 'Arrecife Olvidado', multis: 4, drop: 'lagrima_divina', emj: '💧' },
            { id: 'cana_divina', zona: 'Océano Celestial', multis: 5, drop: 'estrella_abismal', emj: '⭐' },
            { id: 'cana_void', zona: '✨ Abyss of Stars', multis: 6, drop: 'agua_espejismo', emj: '🌫️', secret: true }
        ];

        zonas.sort((a, b) => b.multis - a.multis);
        const mejorCana = zonas.find(z => inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0);

        if (!mejorCana) return input.reply({ content: `╰┈➤ ❌ No tienes cañas. Forja una en \`!!craft\`.`, ephemeral: true });

        // --- ⏳ COOLDOWNS ---
        const cooldown = (data.premiumType === 'ultra') ? 0 : (data.premiumType === 'pro' ? 120000 : 300000);
        const lastFish = data.lastFish || 0;
        if (Date.now() - lastFish < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastFish)) / 1000);
            return input.reply({ content: `⏳ Las aguas están agitadas. Espera \`${espera}s\`.`, ephemeral: true });
        }

        const embedZona = new EmbedBuilder()
            .setTitle(`${e()} ZONA: ${mejorCana.zona} ${e()}`)
            .setColor('#1a1a1a')
            .setDescription(`> *“El reflejo de la luna te guía...”*\n\n¿Lanzar el anzuelo?`);

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_pescar').setLabel('🎣 Pescar').setStyle(ButtonStyle.Primary));
        const response = await input.reply({ embeds: [embedZona], components: [row], fetchReply: true });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return;
            collector.stop();

            const cantDrop = Math.floor(Math.random() * 3 + 1) * mejorCana.multis;

            // --- 📜 GANCHO DE MISIONES ---
            if (data.dailyQuest && !data.dailyQuest.completed) {
                const q = quests[data.dailyQuest.id];
                if (q && q.target === mejorCana.drop) {
                    data.dailyQuest.progress = Math.min(q.goal, (data.dailyQuest.progress || 0) + cantDrop);
                }
            }

            if (!data.inventory) data.inventory = {};
            data.inventory[mejorCana.drop] = (data.inventory[mejorCana.drop] || 0) + cantDrop;
            data.lastFish = Date.now();
            
            await updateUserData(user.id, data);

            const embedExito = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setDescription(`**─── ✦ RED DE PESCA ✦ ───**\n${mejorCana.emj} **${mejorCana.drop.toUpperCase()}**: \`x${cantDrop}\`\n**──────────────────**`);

            return i.update({ embeds: [embedExito], components: [] });
        });
    }
};
