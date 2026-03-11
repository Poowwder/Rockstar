const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- ⚙️ RUTAS DE DATOS ---
const eventsPath = path.join(__dirname, '../data/events.json');
const activeEventPath = path.join(__dirname, '../data/activeEvent.json');

const getE = (guild) => {
    const emojis = guild?.emojis.cache.filter(e => e.available);
    return (emojis && emojis.size > 0) ? emojis.random().toString() : '🌑';
};

module.exports = {
    name: 'evento',
    description: '🌑 Gestión de Eventos Globales (Solo Staff)',
    category: 'admin',
    data: new SlashCommandBuilder()
        .setName('evento')
        .setDescription('Gestión de eventos globales de Rockstar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('start')
                .setDescription('Inicia un evento del catálogo.')
                .addStringOption(o => o.setName('id').setDescription('ID del evento en events.json').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('stop')
                .setDescription('Finaliza el evento actual.')
        ),

    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        const guild = interaction.guild;
        const e = () => getE(guild);

        // 1. Verificar existencia del catálogo
        if (!fs.existsSync(eventsPath)) {
            return interaction.reply({ content: "❌ Error: No se encontró el archivo `data/events.json`.", ephemeral: true });
        }
        
        const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

        // --- 🚀 INICIAR EVENTO ---
        if (sub === 'start') {
            const eventId = interaction.options.getString('id');
            const eventToStart = events[eventId];

            if (!eventToStart) {
                return interaction.reply({ content: `❌ El ID \`${eventId}\` no existe en el catálogo de eventos.`, ephemeral: true });
            }

            // Guardamos el evento como activo en un archivo JSON
            const activeData = { 
                ...eventToStart, 
                id: eventId, 
                startTime: Date.now() 
            };
            
            fs.writeFileSync(activeEventPath, JSON.stringify(activeData, null, 2));

            const eventEmbed = new EmbedBuilder()
                .setTitle(`${e()} EVENTO GLOBAL ACTIVADO ${e()}`)
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
                .setDescription(
                    `> *“Las reglas han cambiado en las sombras de la ciudad.”*\n\n` +
                    `**─── ✦ ${eventToStart.name.toUpperCase()} ✦ ───**\n` +
                    `╰┈➤ **Efecto:** ${eventToStart.description}\n` +
                    `╰┈➤ **Multiplicador:** \`x${eventToStart.multiplier}\` global.\n` +
                    `**─────────────────────**\n\n` +
                    `📢 **¡Atención!** El bonus ya se aplica en \`work\`, \`mine\`, \`fish\` y \`crime\`.`
                )
                .setFooter({ text: `Protocolo iniciado por: ${interaction.user.username} ⊹ Nightfall Ops` });

            return interaction.reply({ embeds: [eventEmbed] });
        }

        // --- 🛑 DETENER EVENTO ---
        if (sub === 'stop') {
            if (fs.existsSync(activeEventPath)) {
                fs.unlinkSync(activeEventPath);
                return interaction.reply({ content: `╰┈➤ ${e()} El evento global ha sido finalizado. Los multiplicadores vuelven a la normalidad.`, ephemeral: true });
            } else {
                return interaction.reply({ content: `❌ No hay ningún evento activo para detener en este momento.`, ephemeral: true });
            }
        }
    }
};
