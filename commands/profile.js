const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Mira tu perfil o el de otro usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Ver perfil de alguien más')),

    async execute(interaction) {
        const target = interaction.options?.getUser('usuario') || interaction.user;
        const data = await getUserData(target.id);
        
        // Formatear información de pareja
        const pareja = data.marry ? `<@${data.marry}>` : "Soltero/a";
        
        // Formatear información de trabajo
        const trabajo = data.job ? data.job.charAt(0).toUpperCase() + data.job.slice(1) : "Desempleado";

        const embed = new EmbedBuilder()
            .setTitle(`👤 Perfil de ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setColor('#FFB6C1')
            .addFields(
                { name: '🌸 Economía', value: `**Cartera:** ${data.wallet || 0}\n**Banco:** ${data.bank || 0}`, inline: true },
                { name: '💍 Relación', value: pareja, inline: true },
                { name: '💼 Profesión', value: trabajo, inline: true },
                { 
                    name: '⛏️ Equipo Actual', 
                    value: data.equippedPickaxe ? `**${data.equippedPickaxe.name}**\nDurabilidad: ${data.equippedPickaxe.durability}/${data.equippedPickaxe.maxDurability}` : "Ninguno", 
                    inline: false 
                }
            )
            .setFooter({ text: `ID: ${target.id}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};