const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'profile',
    description: 'Muestra tu expediente clasificado.',
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

        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '✨';
        };

        try {
            const data = await getUserData(target.id);
            
            const OWNER_ID = '1428164600091902055'; 
            const premium = (data.premiumType || 'none').toLowerCase();
            let rango = (data.premiumType || 'USER').toUpperCase();
            if (target.id === OWNER_ID) rango = '𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆';

            const hp = data.health || 0;
            const displayHp = Math.max(0, Math.floor(hp)); 

            const haremList = data.harem || [];
            const haremCount = haremList.length;

            // Construimos la descripción de forma continua para evitar espacios vacíos
            let descriptionLines = [
                `${getE()} *“Navegando entre las sombras...”* ${getE()}\n`,
                `${getE()} **Rango:** \`${rango}\``,
                `${getE()} **Carisma:** \`${data.rep || 0}\` Pts`,
                `${getE()} **Muertes:** ${data.deadCount || 0}`
            ];

            // --- 💍 SECCIÓN DE MATRIMONIO PURA ---
            if (haremCount > 0) {
                const firstPartner = haremList[0];
                descriptionLines.push(`\n${getE()} **Casada/o con:** \`${firstPartner.username || 'Alguien'}\``);
            }

            descriptionLines.push(`\n**Estado Vital** ${getE()}`);
            descriptionLines.push(`${getE()} **${displayHp} / 3**`);

            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ 
                    name: `⊹ Expediente Clasificado: ${target.username} ⊹`, 
                    iconURL: target.displayAvatarURL({ dynamic: true }) 
                })
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(descriptionLines.join('\n'))
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
                    await i.update({ content: `${getE()} *Expediente cerrado...*`, embeds: [], components: [] });
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
