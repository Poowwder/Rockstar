const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

// --- 💼 DICCIONARIO DE EMPLEOS EXPANDIDO ---
const JOBS = {
    'jardinero': { nombre: 'Jardinero de Cerezos', min: 600, max: 900, emoji: '🎋' },
    'chef': { nombre: 'Chef de Ramen', min: 1100, max: 1600, emoji: '🍜' },
    'idol': { nombre: 'Ídolo de K-Pop', min: 2500, max: 4500, emoji: '🎤' },
    'programador': { nombre: 'Desarrollador de Bots', min: 1800, max: 3000, emoji: '💻' },
    'detective': { nombre: 'Investigador Privado', min: 1300, max: 2200, emoji: '🕵️' },
    'bartender': { nombre: 'Bartender Nightfall', min: 1000, max: 1800, emoji: '🍸' },
    'seguridad': { nombre: 'Guardia VIP', min: 1400, max: 2400, emoji: '🛡️' },
    'tatuador': { nombre: 'Artista del Tatuaje', min: 2200, max: 3800, emoji: '🖋️' },
    'fotografo': { nombre: 'Paparazzi de Élite', min: 1200, max: 2100, emoji: '📸' },
    // --- NUEVOS TRABAJOS ---
    'dj': { nombre: 'DJ de Underground', min: 1600, max: 2800, emoji: '🎧' },
    'corredor': { nombre: 'Piloto de Carreras Ilegales', min: 3000, max: 5500, emoji: '🏎️' },
    'mercenario': { nombre: 'Mercenario a Sueldo', min: 3500, max: 6000, emoji: '⚔️' },
    'estilista': { nombre: 'Estilista de Estrellas', min: 1400, max: 2500, emoji: '✂️' },
    'disenador': { nombre: 'Diseñador Gótico', min: 1900, max: 3200, emoji: '🧥' },
    'musico': { nombre: 'Guitarrista Callejero', min: 700, max: 1200, emoji: '🎸' }
};

module.exports = {
    name: 'work',
    description: 'Ficha tu turno y gana flores por tu labor.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Ficha tu turno y gana flores por tu labor.')
        .addSubcommand(sub => sub.setName('list').setDescription('📋 Mira los trabajos disponibles'))
        .addSubcommand(sub => sub.setName('apply').setDescription('📝 Postúlate a un trabajo')
            .addStringOption(opt => opt.setName('trabajo').setDescription('Elige tu oficio de la lista').setRequired(true)
                .addChoices(
                    { name: 'Jardinero 🎋', value: 'jardinero' },
                    { name: 'Chef de Ramen 🍜', value: 'chef' },
                    { name: 'Ídolo K-Pop 🎤', value: 'idol' },
                    { name: 'Programador 💻', value: 'programador' },
                    { name: 'Detective 🕵️', value: 'detective' },
                    { name: 'Bartender 🍸', value: 'bartender' },
                    { name: 'Guardia VIP 🛡️', value: 'seguridad' },
                    { name: 'Tatuador 🖋️', value: 'tatuador' },
                    { name: 'Paparazzi 📸', value: 'fotografo' },
                    { name: 'DJ Underground 🎧', value: 'dj' },
                    { name: 'Piloto Ilegal 🏎️', value: 'corredor' },
                    { name: 'Mercenario ⚔️', value: 'mercenario' },
                    { name: 'Estilista ✂️', value: 'estilista' },
                    { name: 'Diseñador Gótico 🧥', value: 'disenador' },
                    { name: 'Guitarrista 🎸', value: 'musico' }
                )))
        .addSubcommand(sub => sub.setName('shift').setDescription('⌚ Cumple tu turno'))
        .addSubcommand(sub => sub.setName('resign').setDescription('🚪 Renuncia a tu trabajo')),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const userId = user.id;
        
        let data = await getUserData(userId);
        const now = Date.now();
        
        // --- 💎 CONFIGURACIÓN VIP Y BOOSTS ---
        let cooldown = 3600000; 
        let multiRango = 1, probFail = 0.25, firePenalty = 0.15;

        const prem = (data.premiumType || 'none').toLowerCase();
        if (prem === 'pro' || prem === 'mensual') {
            cooldown = 1800000; multiRango = 1.2; probFail = 0.15; firePenalty = 0.10;
        } else if (prem === 'ultra' || prem === 'bimestral') {
            cooldown = 0; multiRango = 1.5; probFail = 0.05; firePenalty = 0.05;
        }

        // Lógica de Boosts
        data.activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
        const hasMoneyBoost = data.activeBoosts.some(b => b.id === 'boost_flores');
        const multiBoost = hasMoneyBoost ? 2 : 1;

        const processShift = async (interactionToReply) => {
            if (!data.job) return interactionToReply.reply({ content: `╰┈➤ ❌ No tienes empleo. Usa \`!!work apply <trabajo>\`.`, ephemeral: true });
            const currentJob = JOBS[data.job];

            if (Math.random() < probFail) {
                data.workWarnings = (data.workWarnings || 0) + 1;
                data.lastWork = now;
                if (data.workWarnings >= 2) {
                    const penalty = Math.floor((data.wallet || 0) * firePenalty);
                    data.wallet = Math.max(0, data.wallet - penalty);
                    data.job = null; data.workWarnings = 0;
                    await updateUserData(userId, data);
                    return interactionToReply.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`🚨 **DESPIDO:** Tu bajo rendimiento causó pérdidas. Perdiste \`-${penalty.toLocaleString()} 🌸\` y tu empleo.`)] });
                }
                await updateUserData(userId, data);
                return interactionToReply.reply(`⚠️ **Mal desempeño:** Tu jefe te dio una advertencia \`[${data.workWarnings}/2]\`.`);
            } else {
                let ganaBase = Math.floor((Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min);
                let ganaFinal = Math.floor(ganaBase * multiRango * multiBoost);
                
                data.wallet = (data.wallet || 0) + ganaFinal;
                data.lastWork = now;
                data.workWarnings = 0; 
                await updateUserData(userId, data);

                let boostMsg = hasMoneyBoost ? `\n╰┈➤ 🚀 **Boost Activo:** Pago duplicado x2` : "";
                
                return interactionToReply.reply({ embeds: [new EmbedBuilder().setColor('#1a1a1a').setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif').setDescription(`> ${currentJob.emoji} **Turno Finalizado**\n> Trabajaste duro como **${currentJob.nombre}**.\n\n╰┈➤ 💰 **Paga:** \`+${ganaFinal.toLocaleString()} 🌸\`${boostMsg}`)] });
            }
        };

        if (!isSlash) {
            if (!data.job) {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId('select_work').setPlaceholder('🌸 Selecciona un empleo...').addOptions(
                        Object.keys(JOBS).slice(0, 25).map(k => ({ label: JOBS[k].nombre, value: k, emoji: JOBS[k].emoji }))
                    )
                );
                return input.reply({ content: `> ✨ **Bolsa de Empleo Rockstar**\n> Escoge tu camino profesional.`, components: [menu] });
            }

            const timeSince = now - (data.lastWork || 0);
            if (cooldown > 0 && timeSince < cooldown) {
                const rest = cooldown - timeSince;
                return input.reply({ content: `⏳ Estás agotado. Vuelve en **${Math.floor(rest/60000)}m ${Math.floor((rest%60000)/1000)}s**.`, ephemeral: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_shift').setLabel('💼 Fichar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_resign').setLabel('🚪 Renunciar').setStyle(ButtonStyle.Danger)
            );
            
            const response = await input.reply({ 
                content: `<@${userId}>`,
                embeds: [new EmbedBuilder().setColor('#1a1a1a').setDescription(`> 🏢 **Fichaje de Turno**\n> ¿Listo para trabajar como **${JOBS[data.job].nombre}**?`)], 
                components: [row], fetchReply: true 
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

            collector.on('collect', async i => {
                if (i.user.id !== userId) return i.reply({ content: "❌ No es tu turno.", ephemeral: true });
                collector.stop('clicked');
                if (i.customId === 'btn_shift') return processShift(i);
                if (i.customId === 'btn_resign') {
                    data.job = null; await updateUserData(userId, data);
                    return i.reply({ content: "🚪 Has renunciado a tu empleo." });
                }
            });

            collector.on('end', async (c, reason) => {
                if (reason === 'time') {
                    data.workWarnings = (data.workWarnings || 0) + 1;
                    await updateUserData(userId, data);
                    input.editReply({ content: `> ⏳ **Inasistencia.** Advertencia \`[${data.workWarnings}/2]\`.`, embeds: [], components: [] }).catch(() => {});
                }
            });
            return;
        }

        const sub = input.options.getSubcommand();
        if (sub === 'apply') {
            const sel = input.options.getString('trabajo');
            data.job = sel; data.workWarnings = 0;
            await updateUserData(userId, data);
            return input.reply(`🤝 Bienvenido. Ahora eres **${JOBS[sel].nombre}**.`);
        }
        if (sub === 'shift') return processShift(input);
        if (sub === 'list') {
            const list = Object.keys(JOBS).map(k => `${JOBS[k].emoji} **${JOBS[k].nombre}**: \`${JOBS[k].min}-${JOBS[k].max} 🌸\``).join('\n');
            return input.reply({ embeds: [new EmbedBuilder().setTitle('📋 Empleos Rockstar').setColor('#1a1a1a').setDescription(list)] });
        }
    }
};
