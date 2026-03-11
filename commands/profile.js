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
        
        let target;
        if (isSlash) {
            target = input.options.getUser('usuario') || author;
        } else {
            target = input.mentions.users.first() || author;
        }

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

            // --- 💍 SISTEMA DE MATRIMONIOS (10 / 15 / 20) ---
            let maxMarriages = 10;
            if (premium === 'pro' || premium === 'mensual') maxMarriages = 15;
            if (premium === 'ultra' || premium === 'bimestral') maxMarriages = 20;

            const marriages = data.marriages || [];
            const marriageCount = marriages.length;
            
            // Mostrar a las parejas (si son muchas, mostramos las primeras y puntos suspensivos)
            let casadosTexto = marriageCount > 0 
                ? marriages.slice(0, 5).map(id => `<@${id}>`).join(', ') + (marriageCount > 5 ? '...' : '')
                : 'Nadie aún.';

            // --- 📄 CONSTRUCCIÓN DEL EMBED ---
            const embed = new EmbedBuilder()
                .setColor('#1a1a1a')
                .setAuthor({ 
                    name: `⊹ Expediente Clasificado: ${target.username}`, 
                    iconURL: target.displayAvatarURL({ dynamic: true }) 
                })
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(`*“Navegando entre las sombras...”*`)
                .addFields(
                    { name: ' ', value: 
                        `╰┈➤ 💠 **Rango:** \`${rango}\`\n` +
                        `╰┈➤ ✨ **Carisma:** \`${data.rep || 0}\` Pts\n` +
                        `╰┈➤ 💀 **Muertes:** ${data.deadCount || 0}` 
                    },
                    { name: 'Estado Vital', value: `❤️ \`${hp.toFixed(1)} / 3\`\n${filled}${empty}` },
                    { name: '💍 Vínculos y Alianzas', value: `╰┈➤ **Parejas:** ${casadosTexto}\n╰┈➤ **Espacios:** \`[${marriageCount} / ${maxMarriages}]\`` }
                )
                .setFooter({ text: 'Rockstar Database ⊹ Sistema de Identidad' })
                .setTimestamp();

            // --- 🔘 BOTONES DEL PERFIL ---
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_inv').setLabel('🎒 Inventario').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('btn_close').setEmoji('✖️').setStyle(ButtonStyle.Danger)
            );

            const msg = await input.reply({ embeds: [embed], components: [row], fetchReply: true });

            // --- 🖱️ COLECTOR PARA CERRAR ---
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== author.id) return i.reply({ content: '❌ No puedes interactuar con este expediente.', ephemeral: true });
                
                if (i.customId === 'btn_close') {
                    await i.update({ content: '*Expediente cerrado...*', embeds: [], components: [] });
                    return setTimeout(() => msg.delete().catch(() => {}), 2000);
                }
                
                if (i.customId === 'btn_inv') {
                    // Aquí iría tu lógica de inventario si la tienes conectada a este botón
                    return i.reply({ content: '🎒 Esta función de inventario está en mantenimiento.', ephemeral: true });
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
