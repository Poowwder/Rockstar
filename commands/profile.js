const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'profile',
    description: 'Muestra tu expediente clasificado y estado vital.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra tu expediente clasificado')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario del que quieres ver el perfil')
                .setRequired(false)),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        let target;
        if (isSlash) {
            target = input.options.getUser('usuario') || author;
        } else {
            target = input.mentions.users.first() || author;
        }

        // --- ✨ MOTOR DE EMOJIS AL AZAR ---
        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '✨';
        };

        try {
            const data = await getUserData(target.id);
            
            // --- 💎 RANGOS Y VIP ---
            const OWNER_ID = '1428164600091902055'; 
            const premium = (data.premiumType || 'none').toLowerCase();
            let rango = (data.premiumType || 'USER').toUpperCase();
            if (target.id === OWNER_ID) rango = '𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆';

            // --- 🌸 BARRA DE VIDA ---
            const hp = data.health || 0;
            const maxHp = 3;
            const filled = "🌸".repeat(Math.max(0, Math.floor(hp)));
            const empty = "🖤".repeat(Math.max(0, maxHp - Math.floor(hp)));

            // --- 💍 SISTEMA DE MATRIMONIOS ---
            let maxMarriages = 10;
            if (premium === 'pro' || premium === 'mensual') maxMarriages = 15;
            if (premium === 'ultra' || premium === 'bimestral') maxMarriages = 20;

            const marriages = data.marriages || [];
            const marriageCount = marriages.length;

            // --- 📄 CAMPOS DEL EMBED DINÁMICOS ---
            const embedFields = [
                { name: ' ', value: 
                    `${getE()} 💠 **Rango:** \`${rango}\`\n` +
                    `${getE()} ✨ **Carisma:** \`${data.rep || 0}\` Pts\n` +
                    `${getE()} 💀 **Muertes:** ${data.deadCount || 0}` // ✅ Sin paréntesis de (mina/pesca)
                },
                { name: `${getE()} Estado Vital ${getE()}`, value: `❤️ \`${hp.toFixed(1)} / 3\`\n${filled}${empty}` }
            ];

            // Vínculos solo si está casado
            if (marriageCount > 0) {
                // Obtenemos la ID de la pareja principal (Soporta si la DB guarda objeto o string)
                const firstPartner = typeof marriages[0] === 'object' ? (marriages[0].id || marriages[0].user) : marriages[0];
                
                embedFields.push({ 
                    name: `${getE()} 💍 Vínculos y Alianzas ${getE()}`, 
                    value: `${getE()} **Pareja Principal:** <@${firstPartner}>\n${getE()} *Espacios:* \`[${marriageCount} / ${maxMarriages}]\`` 
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ 
                    name: `⊹ Expediente Clasificado: ${target.username} ⊹`, 
                    iconURL: target.displayAvatarURL({ dynamic: true }) 
                })
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(`${getE()} *“Navegando entre las sombras...”* ${getE()}`)
                .addFields(embedFields)
                .setFooter({ text: `${getE()} Rockstar Database ⊹ Sistema de Identidad ${getE()}` })
                .setTimestamp();

            // --- 🔘 BOTONES DEL PERFIL ---
            const row = new ActionRowBuilder();
            
            // Botón Harén solo si está casado
            if (marriageCount > 0) {
                row.addComponents(new ButtonBuilder().setCustomId('btn_harem').setLabel('Harén').setStyle(ButtonStyle.Secondary).setEmoji(getE()));
            }
            
            // Botón de cerrar
            row.addComponents(new ButtonBuilder().setCustomId('btn_close').setLabel('Cerrar').setStyle(ButtonStyle.Danger).setEmoji('✖️'));

            const msg = await input.reply({ embeds: [embed], components: [row], fetchReply: true });

            // --- 🖱️ COLECTOR PARA BOTONES ---
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'btn_close') {
                    if (i.user.id !== author.id) return i.reply({ content: `❌ No puedes cerrar este expediente.`, ephemeral: true });
                    await i.update({ content: `${getE()} *Expediente cerrado...*`, embeds: [], components: [] });
                    return setTimeout(() => msg.delete().catch(() => {}), 2000);
                }
                
                if (i.customId === 'btn_harem') {
                    // Armamos la lista del harén con emojis y tiempos
                    const haremList = marriages.map((m, index) => {
                        // Soporte híbrido: Si la base de datos guarda un objeto { id, date } o solo un string de ID
                        const partnerId = typeof m === 'object' ? (m.id || m.user) : m;
                        const timestamp = typeof m === 'object' ? (m.date || m.timestamp) : null;
                        
                        // Si hay fecha, genera el formato de Discord "Hace X tiempo"
                        const timeStr = timestamp ? ` - *Casados <t:${Math.floor(new Date(timestamp).getTime() / 1000)}:R>*` : '';
                        
                        return `${getE()} **${index + 1}.** <@${partnerId}>${timeStr}`;
                    }).join('\n\n');
                    
                    const haremEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setTitle(`${getE()} 💍 Harén de ${target.username} ${getE()}`)
                        .setDescription(`${getE()} *Límite de expansión: \`[${marriageCount} / ${maxMarriages}]\`*\n\n${haremList}`)
                        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `${getE()} Rockstar Database ${getE()}`, iconURL: i.user.displayAvatarURL() });

                    return i.reply({ embeds: [haremEmbed], ephemeral: true });
                }
            });

            collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));

        } catch (error) {
            console.error("Error en Profile:", error);
            const errorMsg = "❌ Hubo un error al leer los archivos del sistema.";
            if (isSlash) return input.reply({ content: errorMsg, ephemeral: true });
            return input.reply(errorMsg);
        }
    }
};
