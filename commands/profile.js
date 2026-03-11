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

            // --- 🌸 VIDA SIN DECIMALES ---
            const hp = data.health || 0;
            const displayHp = Math.max(0, Math.floor(hp)); 

            let maxMarriages = 10;
            if (premium === 'pro' || premium === 'mensual') maxMarriages = 15;
            if (premium === 'ultra' || premium === 'bimestral') maxMarriages = 20;

            const haremList = data.harem || [];
            const haremCount = haremList.length;

            const embedFields = [
                { name: ' ', value: 
                    `${getE()} 💠 **Rango:** \`${rango}\`\n` +
                    `${getE()} ✨ **Carisma:** \`${data.rep || 0}\` Pts\n` +
                    `${getE()} 💀 **Muertes:** ${data.deadCount || 0}`
                },
                { name: `${getE()} Estado Vital ${getE()}`, value: `❤️ **${displayHp} / 3**` }
            ];

            if (haremCount > 0) {
                const firstPartnerId = haremList[0].id;
                embedFields.push({ 
                    name: `${getE()} 💍 Vínculos y Alianzas ${getE()}`, 
                    value: `${getE()} **Pareja Principal:** <@${firstPartnerId}>\n${getE()} *Espacios:* \`[${haremCount} / ${maxMarriages}]\`` 
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
                .setFooter({ text: `Rockstar Database ⊹ Archivos de Red` }) 
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
                    if (i.user.id !== author.id) return i.reply({ content: `❌ No puedes cerrar este expediente.`, ephemeral: true });
                    await i.update({ content: `${getE()} *Expediente cerrado...*`, embeds: [], components: [] });
                    return setTimeout(() => msg.delete().catch(() => {}), 2000);
                }
                
                if (i.customId === 'btn_harem') {
                    const haremDisplay = haremList.map((m, index) => {
                        const timeStr = m.time ? ` - *Desde <t:${Math.floor(m.time / 1000)}:R>*` : '';
                        return `${getE()} **${index + 1}.** <@${m.id}>${timeStr}`;
                    }).join('\n\n');
                    
                    const haremEmbed = new EmbedBuilder()
                        .setColor('#1a1a1a')
                        .setTitle(`💍 Harén de ${target.username} 💍`)
                        .setDescription(`${getE()} *Límite de expansión: \`[${haremCount} / ${maxMarriages}]\`*\n\n${haremDisplay}`)
                        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Rockstar Database ⊹ Registro de Vínculos` });

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
