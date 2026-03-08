const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marriage')
        .setDescription('Sistema de matrimonio')
        .addSubcommand(s => s.setName('propose').setDescription('Propón matrimonio').addUserOption(o => o.setName('u').setRequired(true).setDescription('Usuario')))
        .addSubcommand(s => s.setName('accept').setDescription('Acepta la propuesta'))
        .addSubcommand(s => s.setName('divorce').setDescription('Divórciate'))
        .addSubcommand(s => s.setName('status').setDescription('Mira tu estado civil')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const data = await getUserData(userId);

        if (sub === 'propose') {
            const target = interaction.options.getUser('u');
            if (!target || target.id === userId) return interaction.reply("❌ Usuario inválido.");
            if (data.marry) return interaction.reply("❌ Ya estás casado.");

            const targetData = await getUserData(target.id);
            targetData.pendingMarriage = userId;
            await updateUserData(target.id, targetData);
            return interaction.reply(`💖 ${interaction.user} le ha propuesto matrimonio a ${target}. ¡Usa \`!marriage accept\` para decir que sí!`);
        }

        if (sub === 'accept') {
            if (!data.pendingMarriage) return interaction.reply("❌ No tienes propuestas pendientes.");
            const partnerId = data.pendingMarriage;
            const partnerData = await getUserData(partnerId);

            data.marry = partnerId;
            data.pendingMarriage = null;
            partnerData.marry = userId;

            await updateUserData(userId, data);
            await updateUserData(partnerId, partnerData);
            return interaction.reply(`🎊 ¡Felicidades! <@${userId}> y <@${partnerId}> se han casado.`);
        }

        if (sub === 'divorce') {
            if (!data.marry) return interaction.reply("❌ No estás casado.");
            const partnerId = data.marry;
            const partnerData = await getUserData(partnerId);

            data.marry = null;
            if (partnerData) partnerData.marry = null;

            await updateUserData(userId, data);
            if (partnerData) await updateUserData(partnerId, partnerData);
            return interaction.reply("💔 El matrimonio ha terminado.");
        }
        
        if (sub === 'status') {
            const status = data.marry ? `Casado(a) con <@${data.marry}>` : "Soltero(a)";
            return interaction.reply(`💍 Estado civil: ${status}`);
        }
    }
};