const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'profile',
    description: 'Muestra tu expediente clasificado y estado vital.',
    category: 'economía',
    // ⚔️ SOPORTE PARA SLASH COMMANDS
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Muestra tu expediente clasificado')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario del que quieres ver el perfil')
                .setRequired(false)),

    async execute(input) {
        // Detectamos si es Slash o Mensaje de prefijo
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        
        // Buscamos al objetivo (mencionado, opción de slash, o el autor)
        let target;
        if (isSlash) {
            target = input.options.getUser('usuario') || author;
        } else {
            target = input.mentions.users.first() || author;
        }

        try {
            const data = await getUserData(target.id);
            
            // 🆔 TU ID REAL para el rango exclusivo
            const OWNER_ID = '1428164600091902055'; 
            let rango = (data.premiumType || 'USER').toUpperCase();
            if (target.id === OWNER_ID) rango = '𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖔𝖛𝖆';

            // 🌸 BARRA DE VIDA
            const hp = data.health || 0;
            const maxHp = 3;
            const filled = "🌸".repeat(Math.max(0, Math.floor(hp)));
            const empty = "🖤".repeat(Math.max(0, maxHp - Math.floor(hp)));

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
                        `╰┈➤ 💀 **Muertes:** ${data.deadCount || 0}` // ✅ Sin paréntesis (mina/pesca)
                    },
                    { name: 'Estado Vital', value: `❤️ \`${hp.toFixed(1)} / 3\`\n${filled}${empty}` }
                )
                .setFooter({ text: 'Rockstar Database ⊹ Sistema de Identidad' })
                .setTimestamp();

            return input.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error en Profile:", error);
            const errorMsg = "❌ Hubo un error al leer los archivos del sistema.";
            if (isSlash) return input.reply({ content: errorMsg, ephemeral: true });
            return input.reply(errorMsg);
        }
    }
};
