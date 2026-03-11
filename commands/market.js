const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '💎';
};

module.exports = {
    name: 'market',
    description: '🔨 Subasta de Reliquias Prohibidas (VIP)',
    category: 'economía',
    data: new SlashCommandBuilder().setName('market').setDescription('🔨 Acceso a la Subasta de Reliquias Prohibidas'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const member = input.member || { displayName: user.username };
        const e = () => getRndEmoji(guild);
        
        let data = await getUserData(user.id);

        // --- 🔒 VERIFICACIÓN PREMIUM ---
        const prem = (data.premiumType || 'none').toLowerCase();
        if (prem === 'none' || prem === 'normal') {
            const noVip = new EmbedBuilder()
                .setTitle(`${e()} ACCESO DENEGADO ${e()}`)
                .setColor('#1a1a1a')
                .setThumbnail('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif')
                .setDescription(`╰┈➤ **${member.displayName}**, tus credenciales no tienen peso aquí. \n\n> *Este mercado solo abre sus puertas para miembros **Premium**.*`);
            
            return input.reply({ embeds: [noVip], ephemeral: true });
        }

        // --- 📊 DATOS DE LA SUBASTA ---
        let pujaActual = 150000;
        let postorID = null;
        let postorTag = "Nadie";
        let reliquia = "Corona de Espinas de Diamante";

        const generarEmbed = () => {
            return new EmbedBuilder()
                .setTitle(`${e()} SUBASTA DEL INFRAMUNDO ${e()}`)
                .setColor('#0a0a0a')
                // Thumbnail de un cofre oscuro o joya negra
                .setThumbnail('https://i.pinimg.com/originals/a0/0a/6e/a00a6e872d3e1d1377a063b5123d24e1.gif') 
                .setDescription(
                    `> *“En la oscuridad, el valor lo pone quien más se arriesga.”*\n\n` +
                    `**─── ✦ LOTE ACTUAL ✦ ───**\n` +
                    `${e()} **Objeto:** \`${reliquia}\`\n` +
                    `${e()} **Puja Mínima:** \`${pujaActual.toLocaleString()} 🌸\`\n` +
                    `${e()} **Líder:** \`${postorTag}\`\n` +
                    `**───────────────────**\n\n` +
                    `╰┈➤ *Pulsa el botón para subir la puja en \`10,000 🌸\`.*`
                )
                .setFooter({ text: `Exclusivo para la élite de Rockstar • Medianoche` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bid_btn')
                .setEmoji('🔨')
                .setLabel('Subir Puja (+10k)')
                .setStyle(ButtonStyle.Secondary) // Gris Rockstar
        );

        const response = await input.reply({ embeds: [generarEmbed()], components: [row], fetchReply: true });

        // --- 🚀 MOTOR DE SUBASTA ---
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id === postorID) {
                return i.reply({ content: `╰┈➤ ${e()} Ya eres el máximo postor, no compitas contra ti mismo.`, ephemeral: true });
            }

            let bidderData = await getUserData(i.user.id);
            const nuevaPuja = pujaActual + 10000;

            if ((bidderData.wallet || 0) < nuevaPuja) {
                return i.reply({ content: `╰┈➤ 💸 Fondos insuficientes. Necesitas \`${nuevaPuja.toLocaleString()} 🌸\`.`, ephemeral: true });
            }

            // Aquí se actualizaría la puja
            pujaActual = nuevaPuja;
            postorID = i.user.id;
            postorTag = i.user.username;

            // Actualizamos el embed original para todos
            await i.update({ embeds: [generarEmbed()] });
        });

        collector.on('end', () => {
            response.edit({ components: [] }).catch(() => null);
        });
    }
};
