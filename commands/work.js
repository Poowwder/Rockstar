const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 

// --- ✨ EMOJIS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

// --- 📋 BASE DE DATOS DE TRABAJOS ---
const JOBS = {
    'jardinero': { nombre: 'Jardinero de Cerezos', min: 500, max: 800, emoji: '🎋' },
    'chef': { nombre: 'Chef de Ramen', min: 1000, max: 1500, emoji: '🍜' },
    'idol': { nombre: 'Ídolo de K-Pop', min: 2000, max: 4000, emoji: '🎤' },
    'hacker': { nombre: 'Hacker Clandestino', min: 1500, max: 2500, emoji: '💻' },
    'detective': { nombre: 'Investigador Privado', min: 1200, max: 2000, emoji: '🕵️' }
};

module.exports = {
    name: 'work',
    description: '💼 Gánate la vida... o piérdela intentándolo.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Elige un empleo para ganar flores 🌸')
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
        
        // --- 💎 CONFIGURACIÓN VIP Y CASTIGOS ---
        let cooldown = 3600000; 
        let multi = 1;  
        let probFail = 0.25;    
        let firePenalty = 0.15;   // Despido Normal: 15%
        let resignPenalty = 0.10; // Renuncia Normal: 10%
        let statusEmoji = "🌸";

        if (data.premiumType === 'mensual') {
            cooldown = 1800000; multi = 1.2; probFail = 0.15; firePenalty = 0.10; resignPenalty = 0.05; statusEmoji = "💎"; // PRO
        } else if (data.premiumType === 'bimestral') {
            cooldown = 0; multi = 1.5; probFail = 0.05; firePenalty = 0.05; resignPenalty = 0.03; statusEmoji = "👑"; // ULTRA
        }

        // =========================================================
        // 🧠 NÚCLEO LÓGICO (Reutilizable para Slash y Botones)
        // =========================================================
        const processResign = async (interactionToReply) => {
            if (!data.job) return interactionToReply.reply({ content: `❌ No tienes empleo del cual renunciar, ${member.displayName}.`, ephemeral: true });

            const oldJob = JOBS[data.job].nombre;
            const penalty = Math.floor((data.wallet || 0) * resignPenalty);
            
            data.wallet = Math.max(0, data.wallet - penalty);
            data.jobResigned = data.job; 
            data.jobResignedTime = now; 
            data.job = null;
            data.workWarnings = 0;
            await updateUserData(userId, data);

            const embed = new EmbedBuilder().setColor('#1a1a1a')
                .setDescription(`> 🚪 **Has decidido abandonar tu puesto de ${oldJob}.**\n\n╰┈➤ 💸 **Liquidación perdida (${resignPenalty * 100}%):** \`-${penalty.toLocaleString()} 🌸\`\n╰┈➤ ⏳ **Restricción:** No podrás volver a este oficio durante 3 días.`);
            return interactionToReply.reply({ embeds: [embed] });
        };

        const processShift = async (interactionToReply) => {
            if (!data.job) return interactionToReply.reply({ content: `❌ No tienes empleo. Usa el menú para conseguir uno.`, ephemeral: true });

            const currentJob = JOBS[data.job];
            const timeSinceLastWork = now - (data.lastWork || now);
            let extraMessage = "";

            // --- 🚨 CONTROL DE AUSENCIAS (48h Despido / 24h Advertencia) ---
            if (timeSinceLastWork > 172800000) { 
                const penalty = Math.floor((data.wallet || 0) * firePenalty);
                data.wallet = Math.max(0, data.wallet - penalty);
                data.job = null;
                data.workWarnings = 0;
                await updateUserData(userId, data);
                const embed = new EmbedBuilder().setColor('#8b0000')
                    .setDescription(`> 🚨 **DESPIDO POR ABANDONO**\n\nNo te presentaste a trabajar por más de 2 días. Fuiste despedido de **${currentJob.nombre}**.\n\n╰┈➤ 💸 **Multa (${firePenalty * 100}%):** \`-${penalty.toLocaleString()} 🌸\``);
                return interactionToReply.reply({ embeds: [embed] });
            }

            if (timeSinceLastWork > 86400000 && !data.absenceWarned) { 
                data.workWarnings = (data.workWarnings || 0) + 1;
                data.absenceWarned = true;
                extraMessage = `\n\n⚠️ **ADVERTENCIA:** Has faltado a tu turno ayer. Acumulas \`[${data.workWarnings}/2]\` advertencias.`;
                if (data.workWarnings >= 2) {
                    const penalty = Math.floor((data.wallet || 0) * firePenalty);
                    data.wallet = Math.max(0, data.wallet - penalty);
                    data.job = null;
                    data.workWarnings = 0;
                    await updateUserData(userId, data);
                    const embed = new EmbedBuilder().setColor('#8b0000')
                        .setDescription(`> 🚨 **DESPIDO DEFINITIVO**\n\nAcumulaste 2 advertencias. El sindicato te ha echado.\n\n╰┈➤ 💸 **Multa (${firePenalty * 100}%):** \`-${penalty.toLocaleString()} 🌸\``);
                    return interactionToReply.reply({ embeds: [embed] });
                }
            }

            // --- ⏳ COOLDOWN REGULAR ---
            if (cooldown > 0 && cooldown - timeSinceLastWork > 0 && !data.absenceWarned) {
                const restanteMs = cooldown - timeSinceLastWork;
                const min = Math.floor(restanteMs / 60000);
                const seg = Math.floor((restanteMs % 60000) / 1000);
                return interactionToReply.reply({ content: `⏳ El turno no empieza aún. Vuelve en **${min}m ${seg}s**.`, ephemeral: true });
            }

            // --- 🎲 RESOLUCIÓN DEL TRABAJO ---
            if (Math.random() < probFail) {
                data.workWarnings = (data.workWarnings || 0) + 1;
                data.lastWork = now;
                data.absenceWarned = false; 
                if (data.workWarnings >= 2) {
                    const penalty = Math.floor((data.wallet || 0) * firePenalty);
                    data.wallet = Math.max(0, data.wallet - penalty);
                    data.job = null;
                    data.workWarnings = 0;
                    await updateUserData(userId, data);
                    const embed = new EmbedBuilder().setColor('#8b0000')
                        .setDescription(`> 🚨 **DESPIDO POR INCOMPETENCIA**\n\nHas arruinado tu trabajo nuevamente. Estás fuera.\n\n╰┈➤ 💸 **Multa (${firePenalty * 100}%):** \`-${penalty.toLocaleString()} 🌸\``);
                    return interactionToReply.reply({ embeds: [embed] });
                } else {
                    await updateUserData(userId, data);
                    return interactionToReply.reply(`> ⚠️ **Hiciste un desastre en tu turno, ${member.displayName}.**\n> Tienes una advertencia \`[${data.workWarnings}/2]\`. Hoy no hay pago.${extraMessage}`);
                }
            } else {
                let gananciaBase = Math.floor(Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min;
                const gananciaFinal = Math.floor(gananciaBase * multi);
                data.wallet = (data.wallet || 0) + gananciaFinal;
                data.lastWork = now;
                data.absenceWarned = false; 
                await updateUserData(userId, data);
                const embed = new EmbedBuilder().setColor('#1a1a1a')
                    .setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif')
                    .setDescription(`> ${currentJob.emoji} **Jornada de ${currentJob.nombre} Terminada**\n\n╰┈➤ 💰 **Paga recibida:** \`+${gananciaFinal.toLocaleString()} 🌸\`\n╰┈➤ 🏦 **Total:** \`${data.wallet.toLocaleString()} 🌸\`${extraMessage}`)
                    .setFooter({ text: `VIP: ${data.premiumType.toUpperCase()} ⊹ Trabajadora: ${member.displayName}` });
                return interactionToReply.reply({ embeds: [embed] });
            }
        };

        // =========================================================
        // 🔀 ENRUTADOR (SLASH COMMANDS)
        // =========================================================
        if (isSlash) {
            const sub = input.options.getSubcommand();
            if (sub === 'list') {
                const listEmbed = new EmbedBuilder().setColor('#1a1a1a')
                    .setDescription(`> ${rndEmj} **Oficios disponibles actualmente:**\n\n╰┈➤ ` + Object.values(JOBS).map(j => `\`${j.nombre}\``).join(', '));
                return input.reply({ embeds: [listEmbed] });
            }
            if (sub === 'apply') {
                const seleccion = input.options.getString('trabajo');
                if (data.job) return input.reply({ content: `❌ Ya eres **${JOBS[data.job].nombre}**. Usa \`/work resign\` primero.`, ephemeral: true });
                if (data.jobResigned === seleccion && now - (data.jobResignedTime || 0) < 259200000) {
                    return input.reply({ content: `⏳ El sindicato te bloqueó. Espera 3 días para volver a ser **${JOBS[seleccion].nombre}**.`, ephemeral: true });
                }
                data.job = seleccion;
                data.workWarnings = 0;
                data.lastWork = now; 
                data.absenceWarned = false;
                await updateUserData(userId, data);
                return input.reply({ embeds: [new EmbedBuilder().setColor('#1a1a1a').setDescription(`> 🤝 **Contrato firmado.** ${rndEmj}\n> Ahora trabajas como **${JOBS[seleccion].nombre}**.`)] });
            }
            if (sub === 'shift') return processShift(input);
            if (sub === 'resign') return processResign(input);
        }

        // =========================================================
        // 🎮 MODO INTERACTIVO (PREFIJO !!work)
        // =========================================================
        if (!isSlash) {
            // SI NO TIENE TRABAJO: MENÚ DESPLEGABLE
            if (!data.job) {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId('select_work').setPlaceholder('🌸 Elige tu oficio de hoy...').addOptions(
                        Object.keys(JOBS).map(k => ({ label: JOBS[k].nombre, description: `Ganas entre ${JOBS[k].min} y ${JOBS[k].max}`, value: k, emoji: JOBS[k].emoji }))
                    )
                );
                const response = await input.reply({ content: `> ✨ **Centro de Empleo de las Sombras** ${statusEmoji}\n> Tienes que conseguir un empleo, ${member.displayName}.`, components: [menu], fetchReply: true });
                const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 40000 });
                
                collector.on('collect', async i => {
                    if (i.user.id !== userId) return i.reply({ content: "❌ Este contrato no está a tu nombre.", ephemeral: true });
                    const sel = i.values[0];
                    if (data.jobResigned === sel && now - (data.jobResignedTime || 0) < 259200000) {
                        return i.reply({ content: `⏳ El sindicato te tiene bloqueado de este oficio por 3 días.`, ephemeral: true });
                    }
                    data.job = sel; data.workWarnings = 0; data.lastWork = Date.now(); data.absenceWarned = false;
                    await updateUserData(userId, data);
                    await i.update({ content: '', embeds: [new EmbedBuilder().setColor('#1a1a1a').setDescription(`> 🤝 **Contrato firmado.** ${rndEmj}\n> Ahora trabajas como **${JOBS[sel].nombre}**. Usa el comando de nuevo para ir a trabajar.`)], components: [] });
                    collector.stop();
                });
                return;
            }

            // SI YA TIENE TRABAJO: BOTONES CON LÍMITE DE TIEMPO
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_shift').setLabel('💼 Ir a Trabajar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_resign').setLabel('🚪 Renunciar').setStyle(ButtonStyle.Danger)
            );
            
            const response = await input.reply({ 
                content: `> 🏢 **Fichaje de Turno** ${statusEmoji}\n> ${member.displayName}, es hora de tomar una decisión. Tienes 15 segundos antes de perder el día.`, 
                components: [row], fetchReply: true 
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

            collector.on('collect', async i => {
                if (i.user.id !== userId) return i.reply({ content: "❌ Este no es tu turno.", ephemeral: true });
                collector.stop('clicked');
                if (i.customId === 'btn_shift') return processShift(i);
                if (i.customId === 'btn_resign') return processResign(i);
            });

            // ⚠️ EL CASTIGO POR NO RESPONDER A TIEMPO
            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    // Refrescamos la data por si acaso
                    let freshData = await getUserData(userId);
                    freshData.workWarnings = (freshData.workWarnings || 0) + 1;
                    
                    let timeMsg = `> ⏳ **El tiempo se agotó, ${member.displayName}.**\n> Te quedaste dormida y perdiste el día de trabajo. Tienes una advertencia \`[${freshData.workWarnings}/2]\`.`;
                    
                    if (freshData.workWarnings >= 2) {
                        const penalty = Math.floor((freshData.wallet || 0) * firePenalty);
                        freshData.wallet = Math.max(0, freshData.wallet - penalty);
                        freshData.job = null;
                        freshData.workWarnings = 0;
                        timeMsg = `> 🚨 **DESPIDO POR NEGLIGENCIA**\n> El tiempo se agotó. Faltaste a tu turno y acumulaste 2 advertencias.\n> Estás fuera y pierdes \`${penalty} 🌸\`.`;
                    }
                    
                    await updateUserData(userId, freshData);
                    input.editReply({ content: timeMsg, components: [] }).catch(() => {});
                }
            });
        }
    }
};
