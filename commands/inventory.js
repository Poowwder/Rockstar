const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Mira tu dinero, materiales y herramientas')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario para ver su inventario')),

    async execute(interaction) {
        // Soporte para ver el inventario de otros (Híbrido)
        const target = interaction.options?.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);

        // Seguridad: Asegurarnos de que inventory existe
        const inv = data.inventory || {};

        // Función para la barra de durabilidad
        const drawBar = (current, max) => {
            const size = 10;
            const filled = Math.round((current / max) * size);
            const empty = size - filled;
            // Evitar valores negativos si el pico se rompe mucho
            return "🟩".repeat(Math.max(0, filled)) + "⬜".repeat(Math.max(0, empty));
        };

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventario de ${target.username}`)
            .setColor('#2b2d31')
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { 
                    name: '💰 Economía', 
                    value: `**Cartera:** ${data.wallet || 0} 🌸\n**Banco:** ${data.bank || 0} 🌸`, 
                    inline: false 
                },
                { 
                    name: '⛏️ Herramienta Equipada', 
                    value: data.equippedPickaxe?.name 
                        ? `**${data.equippedPickaxe.name}**\n${drawBar(data.equippedPickaxe.durability, data.equippedPickaxe.maxDurability)}\n\`${data.equippedPickaxe.durability}/${data.equippedPickaxe.maxDurability}\``
                        : 'Ninguna', 
                    inline: true 
                },
                { 
                    name: '📦 Materiales', 
                    value: `🪵 Madera: \`${inv.madera || 0}\`
⛓️ Hierro: \`${inv.hierro || 0}\`
🟡 Oro: \`${inv.oro || 0}\`
💎 Diamante: \`${inv.diamante || 0}\`
🛡️ Amuleto: \`${inv.amuleto_proteccion || 0}\``, 
                    inline: true 
                }
            )
            .setFooter({ text: 'Usa /mine o !mine para conseguir materiales' });

        return interaction.reply({ embeds: [embed] });
    }
};