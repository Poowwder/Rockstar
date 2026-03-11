const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

// --- ✨ EMOJIS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

const JOBS = {
    'jardinero': { nombre: 'Jardinero de Cerezos', min: 500, max: 800, emoji: '🎋' },
    'chef': { nombre: 'Chef de Ramen', min: 1000, max: 1500, emoji: '🍜' },
    'idol': { nombre: 'Ídolo de K-Pop', min: 2000, max: 4000, emoji: '🎤' },
    'hacker': { nombre: 'Hacker Clandestino', min: 1500, max: 2500, emoji: '💻' },
    'detective': { nombre: 'Investigador Privado', min: 1200, max: 2000, emoji: '🕵️' }
};

module.exports = {
    name: 'work',
    description: 'Ficha tu turno y gana flores por tu labor.', // ✅ DESCRIPCIÓN CORREGIDA
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Ficha tu turno y gana flores por tu labor.') // ✅ DESCRIPCIÓN CORREGIDA
        .addSubcommand(sub => sub.setName('list').setDescription('📋 Mira los trabajos disponibles'))
        .addSubcommand(sub => sub.setName('apply').setDescription('📝 Postúlate a un trabajo')
            .addStringOption(opt => opt.setName('trabajo').setDescription('Elige tu oficio de la lista').setRequired(true)
                .addChoices(
                    { name: 'Jardinero de Cerezos 🎋', value: 'jardinero' },
                    { name: 'Chef de Ramen 🍜', value: 'chef' },
                    { name: 'Ídolo de K-Pop 🎤', value: 'idol' },
                    { name: 'Hacker Clandestino 💻', value: 'hacker' },
                    { name: 'Investigador Privado 🕵️', value: 'detective' }
                )))
        .addSubcommand(sub => sub.setName('shift').setDescription('⌚ Cumple tu turno (Slash Command)'))
        .addSubcommand(sub => sub.setName('resign').setDescription('🚪 Renuncia a tu trabajo (Slash Command)')),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const userId = user.id;
        const member = guild ? (guild.members.cache.get(userId) || { displayName: user.username }) : { displayName: user.username };
        const rndEmj = getRndEmoji(guild);
        
        let data = await getUserData(userId);
        const now = Date.now();
        
        // --- 💎 CONFIGURACIÓN VIP ---
        let cooldown = 3600000; 
        let multi = 1;  
        let probFail = 0.25;    
        let firePenalty = 0.15;
        let resignPenalty = 0.10;
        let statusEmoji = "🌸";

        const prem = (data.premiumType || 'none').toLowerCase();
        if (prem === 'pro' || prem === 'mensual') {
            cooldown = 1800000; multi = 1.2; probFail = 0.15; firePenalty = 0.10; resignPenalty = 0.05; statusEmoji = "💎";
        } else if (prem === 'ultra' || prem === 'bimestral') {
            cooldown = 0; multi = 1.5; probFail = 0.05; firePenalty = 0.05; resignPenalty = 0.03; statusEmoji = "👑";
        }

        // =========================================================
        // 🧠 NÚCLEO LÓGICO
        // =========================================================
        const processShift = async (interactionToReply) => {
            if (!data.job) return interactionToReply.reply({ content: `❌ No tienes empleo.`, ephemeral: true });
            const currentJob = JOBS[data.job];
            const timeSinceLastWork = now - (data.lastWork || 0);

            // 🎲 RESOLUCIÓN
            if (Math.random() < probFail) {
                data.workWarnings = (data.workWarnings || 0) + 1;
                data.lastWork = now;
                if (data.workWarnings >= 2) {
                    const penalty = Math.floor((data.wallet || 0) * firePenalty);
                    data.wallet = Math.max(0, data.wallet - penalty);
                    data.job = null; data.workWarnings = 0;
                    await updateUserData(userId, data);
                    return interactionToReply.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`🚨 **DESPIDO:** Acumulaste 2 advertencias. Pierdes \`-${penalty.toLocaleString()} 🌸\`.`)] });
                }
                await updateUserData(userId, data);
                return interactionToReply.reply(`⚠️ **Mal desempeño:** Advertencia \`[${data.workWarnings}/2]\`. Hoy no hay paga.`);
            } else {
                let ganancia = Math.floor((Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min) * multi;
                data.wallet = (data.wallet || 0) + ganancia;
                data.lastWork = now;
                data.workWarnings = 0; // Se resetean advertencias si trabaja bien
                await updateUserData(userId, data);
                return interactionToReply.reply({ embeds: [new EmbedBuilder().setColor('#1a1a1a').setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif').setDescription(`> ${currentJob.emoji} **Jornada Terminada**\n\n╰┈➤ 💰 **Paga:** \`+${ganancia.toFixed(0)} 🌸\``)] });
            }
        };

        // =========================================================
        // 🎮 MODO INTERACTIVO (PREFIJO !!work)
        // =========================================================
        if (!isSlash) {
            // 1. SI NO TIENE TRABAJO
            if (!data.job) {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId('select_work').setPlaceholder('🌸 Elige tu oficio...').addOptions(
                        Object.keys(JOBS).map(k => ({ label: JOBS[k].nombre, value: k, emoji: JOBS[k].emoji }))
                    )
                );
                return input.reply({ content: `> ✨ **Centro de Empleo**\n> Consigue un trabajo para empezar.`, components: [menu] });
            }

            // 🔥 FIX: VERIFICAR COOLDOWN ANTES DE MOSTRAR EL MENÚ DE 3 MINUTOS
            const timeSinceLastWork = now - (data.lastWork || 0);
            if (cooldown > 0 && timeSinceLastWork < cooldown) {
                const restante = cooldown - timeSinceLastWork;
                const min = Math.floor(restante / 60000);
                const seg = Math.floor((restante % 60000) / 1000);
                return input.reply({ content: `⏳ El turno no empieza aún. Vuelve en **${min}m ${seg}s**.`, ephemeral: true });
            }

            // 2. SI TIENE TRABAJO Y NO HAY COOLDOWN
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_shift').setLabel('💼 Ir a Trabajar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_resign').setLabel('🚪 Renunciar').setStyle(ButtonStyle.Danger)
            );
            
            const response = await input.reply({ 
                content: `<@${userId}>`,
                embeds: [new EmbedBuilder().setColor('#1a1a1a').setDescription(`> 🏢 **Fichaje de Turno**\n> Tienes 3 minutos para fichar o será falta injustificada.`)], 
                components: [row], 
                fetchReply: true 
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

            collector.on('collect', async i => {
                if (i.user.id !== userId) return i.reply({ content: "❌ No es tu turno.", ephemeral: true });
                collector.stop('clicked');
                if (i.customId === 'btn_shift') return processShift(i);
                if (i.customId === 'btn_resign') {
                    data.job = null; await updateUserData(userId, data);
                    return i.reply({ content: "🚪 Has renunciado satisfactoriamente." });
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    data.workWarnings = (data.workWarnings || 0) + 1;
                    await updateUserData(userId, data);
                    input.editReply({ content: `> ⏳ **Tiempo agotado.** Faltaste al trabajo. Advertencia \`[${data.workWarnings}/2]\`.`, embeds: [], components: [] }).catch(() => {});
                }
            });
            return;
        }

        // =========================================================
        // 🔀 SLASH COMMANDS (Enrutador)
        // =========================================================
        const sub = input.options.getSubcommand();
        if (sub === 'apply') {
            const sel = input.options.getString('trabajo');
            data.job = sel; data.lastWork = now;
            await updateUserData(userId, data);
            return input.reply(`🤝 Ahora eres **${JOBS[sel].nombre}**.`);
        }
        if (sub === 'shift') return processShift(input);
    }
};
