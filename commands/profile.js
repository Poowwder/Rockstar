const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'profile',
    description: 'Muestra tu perfil.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra tu perfil en las sombras')
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

        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '🌑';
        };

        try {
            const data = await getUserData(target.id);
            
            const OWNER_ID = '1428164600091902055'; 
            const premium = (data.premiumType || 'none').toLowerCase();
            let rango = (data.premiumType || 'USER').toUpperCase();
            if (target.id === OWNER_ID) rango = '𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆';

            const hp = data.health || 0;
            const displayHp = Math.max(0, Math.floor(hp)); 

            // --- 💍 LÓGICA DE DATOS DE MATRIMONIO ---
            // Revisamos tanto 'harem' como 'marriages' por si acaso
            const haremList = data.harem || data.marriages || [];
            const haremCount = haremList.length;

            const embedFields = [
                { name: ' ', value: 
                    `${getE()} **Rango:** \`${rango}\`\n` +
                    `${getE()} **Carisma:** \`${data.rep || 0}\` Pts\n` +
                    `${getE()} **Muertes:** ${data.deadCount || 0}`
                }
            ];

            // Si hay alguien en la lista, lo pegamos al primer bloque
            if (haremCount > 0) {
                const firstPartner = haremList[0];
                // Intentamos sacar el nombre del objeto, si no, mostramos "Alguien"
                const partnerName = firstPartner.username || firstPartner.tag || 'Alguien';
                embedFields[0].value += `\n${getE()} **Casada/o con:** \`${partnerName}\``;
            }

            // Mantenemos la separación que te gusta para el Estado Vital
            embedFields.push({ 
                name: `${getE()} Estado Vital ${getE()}`, 
                value: `${getE()} **${displayHp} / 3**` 
            });

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ 
                    name: `⊹ ${target.username} ⊹`, // Título limpio como pediste
                    iconURL: target.displayAvatarURL({ dynamic: true }) 
                })
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(`${getE()} *“Navegando entre las sombras...”* ${getE()}`)
                .addFields(embedFields)
                .setFooter({ text: `Rockstar ⊹ Nightfall` }) 
                .setTimestamp();

            const row = new ActionRowBuilder();
            
            if (haremCount > 0) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_harem')
                        .setLabel('Harem') 
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(getE())
                );
            }
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_close')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(getE())
            );

            const msg = await input.reply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'btn_close') {
                    if (i.user.id !== author.id) return i.reply({ content: `❌ No puedes cerrar esto.`, ephemeral: true });
                    await i.update({ content: `${getE()} *Perfil cerrado...*`, embeds: [], components: [] });
                    return setTimeout(() => msg.delete().catch(() => {}), 2000);
                }
                
                if (i.customId === 'btn_harem') {
                    let maxMarriages = 10;
                    if (premium === 'pro' || premium === 'mensual') maxMarriages = 15;
                    if (premium === 'ultra' || premium === 'bimestral') maxMarriages = 20;

                    const haremDisplay = haremList.map((m, index) => {
                        const timeStr = m.time ? ` - *Desde <t:${Math.floor(m.time / 1000)}:R>*` : '';
                        return `${getE()} **${index + 1}.** \`${m.username || 'Desconocido'}\`${timeStr}`;
                    }).join('\n\n');
                    
                    const haremEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setTitle(`${getE()} Harem de ${target.username} ${getE()}`)
                        .setDescription(`${getE()} *Espacios: \`[${haremCount} / ${maxMarriages}]\`*\n\n${haremDisplay}`)
                        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Rockstar ⊹ Eternal Vault` }); 

                    return i.reply({ embeds: [haremEmbed], ephemeral: true });
                }
            });

            collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));

        } catch (error) {
            console.error("Error en Profile:", error);
            const errorMsg = "❌ Fallo en el sistema.";
            if (isSlash) return input.reply({ content: errorMsg, ephemeral: true });
            return input.reply(errorMsg);
        }
    }
};
