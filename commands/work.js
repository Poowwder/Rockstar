const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 
const fs = require('fs');
const path = require('path');

// --- 🏆 CONFIGURACIÓN DE ASCENSOS ---
const RANGOS_LABORALES = [
    { nombre: 'Pasante', minTurnos: 0, bono: 1.0, color: '#95a5a6' },
    { nombre: 'Junior', minTurnos: 15, bono: 1.2, color: '#3498db' },
    { nombre: 'Senior', minTurnos: 40, bono: 1.5, color: '#9b59b6' },
    { nombre: 'Veterano', minTurnos: 80, bono: 1.8, color: '#e67e22' },
    { nombre: 'Leyenda', minTurnos: 150, bono: 2.2, color: '#f1c40f' }
];

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
    'dj': { nombre: 'DJ de Underground', min: 1600, max: 2800, emoji: '🎧' },
    'corredor': { nombre: 'Piloto de Carreras Ilegales', min: 3000, max: 5500, emoji: '🏎️' },
    'mercenario': { nombre: 'Mercenario a Sueldo', min: 3500, max: 6000, emoji: '⚔️' },
    'estilista': { nombre: 'Estilista de Estrellas', min: 1400, max: 2500, emoji: '✂️' },
    'disenador': { nombre: 'Diseñador Gótico', min: 1900, max: 3200, emoji: '🧥' },
    'musico': { nombre: 'Guitarrista Callejero', min: 700, max: 1200, emoji: '🎸' }
};

module.exports = {
    name: 'work',
    description: 'Ficha tu turno y asciende en tu carrera profesional.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Ficha tu turno y gana flores por tu labor.')
        .addSubcommand(sub => sub.setName('list').setDescription('📋 Mira los trabajos disponibles'))
        .addSubcommand(sub => sub.setName('apply').setDescription('📝 Postúlate a un trabajo').addStringOption(opt => opt.setName('trabajo').setDescription('ID del oficio').setRequired(true)))
        .addSubcommand(sub => sub.setName('shift').setDescription('⌚ Cumple tu turno'))
        .addSubcommand(sub => sub.setName('resign').setDescription('🚪 Renuncia a tu trabajo')),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const userId = user.id;
        let data = await getUserData(userId);
        const now = Date.now();
        
        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
      // Dentro de work.js, crime.js y daily.js
const activePath = path.join(__dirname, '../data/activeEvent.json');
let multiEvento = 1;

if (fs.existsSync(activePath)) {
    const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    // Estos comandos solo dan bonus si el evento es de dinero.
    if (ev.type === 'money') multiEvento = ev.multiplier;
}

        // --- 💎 CONFIGURACIÓN VIP Y BONOS POR RANGO (3%, 7%, 10%) ---
        let cooldown = 3600000, multiRango = 1.03, probFail = 0.25;
        const prem = (data.premiumType || 'none').toLowerCase();
        
        if (prem === 'pro' || prem === 'mensual') { 
            cooldown = 1800000; 
            multiRango = 1.07; 
            probFail = 0.15; 
        }
        else if (prem === 'ultra' || prem === 'bimestral') { 
            cooldown = 0; 
            multiRango = 1.10; 
            probFail = 0.05; 
        }

        data.activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
        const multiBoost = data.activeBoosts.some(b => b.id === 'boost_flores') ? 2 : 1;

        const processShift = async (interactionToReply) => {
            if (!data.job) return interactionToReply.reply({ content: `╰┈➤ ❌ No tienes empleo. Usa \`!!work\` para elegir uno.`, ephemeral: true });
            
            const currentJob = JOBS[data.job];
            const expActual = data.jobExperience || 0;
            const rangoActual = [...RANGOS_LABORALES].reverse().find(r => expActual >= r.minTurnos);

            if (Math.random() < probFail) {
                data.workWarnings = (data.workWarnings || 0) + 1;
                data.lastWork = now;
                if (data.workWarnings >= 2) {
                    data.job = null; data.jobExperience = 0; data.workWarnings = 0;
                    await updateUserData(userId, data);
                    return interactionToReply.reply(`🚨 **DESPIDO:** Fuiste despedido por acumular advertencias. Tu reputación en esta empresa ha vuelto a cero.`);
                }
                await updateUserData(userId, data);
                return interactionToReply.reply(`⚠️ **Fallo:** Cometiste un error grave en tu turno. Advertencia \`[${data.workWarnings}/2]\`.`);
            } else {
                let ganaBase = Math.floor((Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min);
                
                // --- CÁLCULO FINAL: Base * MultiEvento * MultiRango (Premium) * MultiBoost * BonoLaboral ---
                let ganaFinal = Math.floor((ganaBase * multiEvento) * multiRango * multiBoost * rangoActual.bono);
                
                data.jobExperience = expActual + 1;
                data.wallet = (data.wallet || 0) + ganaFinal;
                data.lastWork = now;
                data.workWarnings = 0;

                const proximoRango = RANGOS_LABORALES.find(r => data.jobExperience === r.minTurnos);
                let ascensoMsg = proximoRango ? `\n\n🎊 **¡ASCENSO!** Ahora eres **${proximoRango.nombre}**.` : "";

                await updateUserData(userId, data);

                const workEmbed = new EmbedBuilder()
                    .setColor(rangoActual.color)
                    .setThumbnail('https://i.pinimg.com/originals/33/c2/f7/33c2f7034f40d0263309a96e987c9f8a.gif')
                    .setTitle(`💼 JORNADA COMPLETADA`)
                    .setDescription(
                        `> ${currentJob.emoji} **Puesto:** ${currentJob.nombre}\n` +
                        `> **Rango Laboral:** \`${rangoActual.nombre}\` (Bono x${rangoActual.bono})\n\n` +
                        `╰┈➤ 💰 **Paga:** \`+${ganaFinal.toLocaleString()} 🌸\`\n` +
                        `╰┈➤ 📊 **Bonus Rango:** \`+${((multiRango-1)*100).toFixed(0)}%\`\n` +
                        (multiEvento > 1 ? `╰┈➤ 🌟 **Evento:** \`x${multiEvento} Activo\`\n` : "") +
                        `╰┈➤ 📈 **Experiencia:** \`${data.jobExperience}\` turnos.${ascensoMsg}`
                    );

                return interactionToReply.reply({ embeds: [workEmbed] });
            }
        };

        // --- LÓGICA DE RENUNCIA ---
        if ((!isSlash && input.content?.includes('resign')) || (isSlash && input.options.getSubcommand() === 'resign')) {
            data.job = null; data.jobExperience = 0; await updateUserData(userId, data);
            return input.reply("🚪 Has renunciado satisfactoriamente. Tu experiencia laboral ha vuelto a cero.");
        }

        // --- MODO INTERACTIVO (!!work) ---
        if (!isSlash) {
            if (!data.job) {
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_work')
                        .setPlaceholder('🌸 Elige tu profesión...')
                        .addOptions(Object.keys(JOBS).map(k => ({ label: JOBS[k].nombre, value: k, emoji: JOBS[k].emoji })))
                );
                
                const response = await input.reply({ content: `> ✨ **Bolsa de Empleo Rockstar**\n> Selecciona una carrera para empezar.`, components: [menu] });
                const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

                collector.on('collect', async i => {
                    if (i.user.id !== userId) return i.reply({ content: "❌ No puedes elegir por otro.", ephemeral: true });
                    const selection = i.values[0];
                    data.job = selection;
                    data.jobExperience = 0;
                    await updateUserData(userId, data);
                    await i.update({ content: `🤝 **Contratado:** Ahora eres **${JOBS[selection].nombre}**. ¡Bienvenido al equipo!`, components: [] });
                    collector.stop();
                });
                return;
            }

            const rest = cooldown - (now - (data.lastWork || 0));
            if (cooldown > 0 && rest > 0) {
                const min = Math.floor(rest/60000);
                const seg = Math.floor((rest%60000)/1000);
                return input.reply({ content: `⏳ Estás agotado. Vuelve en **${min}m ${seg}s**.`, ephemeral: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_shift').setLabel('💼 Fichar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_resign').setLabel('🚪 Renunciar').setStyle(ButtonStyle.Danger)
            );

            const res = await input.reply({ 
                content: `<@${userId}>`, 
                embeds: [new EmbedBuilder().setColor('#1a1a1a').setDescription(`> 🏢 **Turno Pendiente**\n> Puesto: **${JOBS[data.job].nombre}**\n> Rango: \`${[...RANGOS_LABORALES].reverse().find(r => data.jobExperience >= r.minTurnos).nombre}\``)], 
                components: [row], 
                fetchReply: true 
            });

            const collector = res.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
            collector.on('collect', async i => {
                if (i.user.id !== userId) return i.reply({ content: "❌ No es tu turno.", ephemeral: true });
                collector.stop();
                if (i.customId === 'btn_shift') return processShift(i);
                if (i.customId === 'btn_resign') {
                    data.job = null; data.jobExperience = 0; await updateUserData(userId, data);
                    return i.update({ content: "🚪 Renunciaste satisfactoriamente.", embeds: [], components: [] });
                }
            });
            return;
        }

        // --- SLASH COMMANDS (Enrutador) ---
        if (isSlash) {
            const sub = input.options.getSubcommand();
            if (sub === 'apply') {
                const sel = input.options.getString('trabajo').toLowerCase();
                if (!JOBS[sel]) return input.reply("❌ Ese trabajo no existe.");
                data.job = sel; data.jobExperience = 0; await updateUserData(userId, data);
                return input.reply(`🤝 Bienvenido. Tu puesto de **${JOBS[sel].nombre}** te espera.`);
            }
            if (sub === 'shift') return processShift(input);
            if (sub === 'list') {
                const list = Object.keys(JOBS).map(k => `${JOBS[k].emoji} **${JOBS[k].nombre}**: \`${JOBS[k].min}-${JOBS[k].max} 🌸\``).join('\n');
                return input.reply({ embeds: [new EmbedBuilder().setTitle('📋 Empleos Rockstar').setColor('#1a1a1a').setDescription(list)] });
            }
        }
    }
};
