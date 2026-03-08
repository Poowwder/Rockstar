const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('Propón matrimonio a alguien o divórciate')
        .addSubcommand(sub => sub.setName('propose').setDescription('Propón matrimonio a alguien').addUserOption(o => o.setName('usuario').setDescription('Tu alma gemela').setRequired(true)))
        .addSubcommand(sub => sub.setName('divorce').setDescription('Terminar tu relación actual')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const data = await getUserData(interaction.user.id);

        if (sub === 'propose') {
            const target = interaction.options.getUser('usuario');
            if (target.id === interaction.user.id) return interaction.reply("❌ No puedes casarte contigo mismo.");
            if (data.marryId) return interaction.reply("❌ Ya estás casado. Debes divorciarte primero.");

            const targetData = await getUserData(target.id);
            if (targetData.marryId) return interaction.reply("❌ Esa persona ya está casada.");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept_marry').setLabel('¡Acepto! 💍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('deny_marry').setLabel('Rechazar 💔').setStyle(ButtonStyle.Danger)
            );

            const msg = await interaction.reply({
                content: `✨ <@${target.id}>, **${interaction.user.username}** te ha propuesto matrimonio. ¿Aceptas?`,
                components: [row]
            });

            const filter = i => i.user.id === target.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'accept_marry') {
                    data.marryId = target.id;
                    targetData.marryId = interaction.user.id;
                    await updateUserData(interaction.user.id, data);
                    await updateUserData(target.id, targetData);
                    await i.update({ content: `🎊 ¡Felicidades! <@${interaction.user.id}> y <@${target.id}> ahora están casados! 🥂`, components: [] });
                } else {
                    await i.update({ content: `💔 La propuesta fue rechazada...`, components: [] });
                }
            });
        } 

        if (sub === 'divorce') {
            if (!data.marryId) return interaction.reply("❌ No estás casado actualmente.");
            
            const exId = data.marryId;
            const exData = await getUserData(exId);

            data.marryId = null;
            if (exData) {
                exData.marryId = null;
                await updateUserData(exId, exData);
            }
            await updateUserData(interaction.user.id, data);

            return interaction.reply("💔 Te has divorciado. Ahora eres libre de nuevo.");
        }
    }
};