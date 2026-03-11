const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const quests = require('../data/quests.json'); 
const fs = require('fs');
const path = require('path');

const getE = (guild) => {
    const source = guild ? guild.emojis.cache : null;
    return (source && source.filter(e => e.available).size > 0) ? source.random().toString() : '✨';
};

module.exports = {
    name: 'mine',
    description: '⛏️ Extrae materiales de las profundidades.',
    category: 'economía',
    async execute(input) {
        const user = input.user || input.author;
        const guild = input.guild;
        const e = () => getE(guild);
        
        let data = await getUserData(user.id);
        const inv = data.inventory || {};
        const premium = (data.premiumType || 'none').toLowerCase();

        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
      // Dentro de mine.js y fish.js
const activePath = path.join(__dirname, '../data/activeEvent.json');
let multiEvento = 1;

if (fs.existsSync(activePath)) {
    const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    // Cambia 'money' por 'materials' para que estos comandos 
    // solo den bonus si el evento es de minería/pesca.
    if (ev.type === 'materials') multiEvento = ev.multiplier;
}

        // --- 💎 BONO POR RANGO PREMIUM (Materiales extra) ---
        let bonoRango = 1.03; 
        if (premium === 'pro') bonoRango = 1.07;
        if (premium === 'ultra') bonoRango = 1.10;

        // --- 🗺️ DEFINICIÓN DE ZONAS ---
        let zonas = [
            { id: 'pico_madera', zona: 'Gruta Superficial', multis: 1, drop: 'mineral_roca', emj: '🪨' },
            { id: 'pico_piedra', zona: 'Caverna de Cuarzo', multis: 2, drop: 'hierro_bruto', emj: '⛓️' },
            { id: 'pico_hierro', zona: 'Venas de Acero', multis: 3, drop: 'cristal_profundo', emj: '💎' },
            { id: 'pico_diamante', zona: 'Fosa de Cristal', multis: 4, drop: 'gema_mitica', emj: '🔮' },
            { id: 'pico_mitico', zona: 'Abismo Eterno', multis: 5, drop: 'fragmento_void', emj: '🌌' },
            { id: 'pico_void', zona: '✨ Void Haven', multis: 6, drop: 'polvo_astral', emj: '✨', secret: true }
        ];

        zonas.sort((a, b) => b.multis - a.multis);
        const mejorPico = zonas.find(z => inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0);

        if (!mejorPico) return input.reply({ content: `╰┈➤ ❌ No tienes picos. Forja uno en \`!!craft\`.`, ephemeral: true });

        // --- ⏳ COOLDOWNS ---
        const cooldown = (premium === 'ultra') ? 0 : (premium === 'pro' ? 120000 : 300000);
        const lastMine = data.lastMine || 0;
        if (Date.now() - lastMine < cooldown) {
            const espera = Math.ceil((cooldown - (Date.now() - lastMine)) / 1000);
            return input.reply({ content: `⏳ El polvo no se ha asentado. Espera \`${espera}s\`.`, ephemeral: true });
        }

        const embedZona = new EmbedBuilder()
            .setTitle(`${e()} ZONA: ${mejorPico.zona} ${e()}`)
            .setColor('#1a1a1a')
            .setDescription(`> *“El silencio de la piedra te da la bienvenida.”*\n\n¿Deseas empezar a picar?`)
            .setFooter({ text: `Equipado: ${mejorPico.id}` });

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_minar').setLabel('⛏️ Minar').setStyle(ButtonStyle.Secondary));
        const response = await input.reply({ embeds: [embedZona], components: [row], fetchReply: true });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== user.id) return;
            collector.stop();

            // --- 💰 CÁLCULO FINAL CON EVENTO Y RANGO ---
            const baseDrop = Math.floor(Math.random() * 3 + 2) * mejorPico.multis;
            const cantDrop = Math.floor((baseDrop * multiEvento) * bonoRango);
            
            // --- 📜 GANCHO DE MISIONES ---
            if (data.dailyQuest && !data.dailyQuest.completed) {
                const q = quests[data.dailyQuest.id];
                if (q && q.target === mejorPico.drop) {
                    data.dailyQuest.progress = Math.min(q.goal, (data.dailyQuest.progress || 0) + cantDrop);
                }
            }

            // Actualizar inventario y salud
            data.inventory[mejorPico.drop] = (data.inventory[mejorPico.drop] || 0) + cantDrop;
            data.lastMine = Date.now();
            
            await updateUserData(user.id, data);

            const embedExito = new EmbedBuilder()
                .setTitle(`${e()} EXTRACCIÓN EXITOSA ${e()}`)
                .setColor('#1a1a1a')
                .setDescription(
                    `**─── ✦ RESULTADOS ✦ ───**\n` +
                    `${mejorPico.emj} **${mejorPico.drop.toUpperCase()}**: \`x${cantDrop}\`\n` +
                    `**───────────────────**\n` +
                    `╰┈➤ *Bono Rango:* \`+${((bonoRango-1)*100).toFixed(0)}%\`\n` +
                    (multiEvento > 1 ? `╰┈➤ *Evento:* \`x${multiEvento} Activo\`` : "")
                );

            return i.update({ embeds: [embedExito], components: [] });
        });
    }
};
