const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Envía flores a otro usuario (Solo Premium)')
        .addUserOption(opt => opt.setName('usuario').setDescription('A quién quieres pagar').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad de flores').setRequired(true)),

    async execute(interaction) {
        const senderId = interaction.user.id;
        const targetUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        // 1. Validaciones básicas
        if (targetUser.id === senderId) return interaction.reply("❌ No puedes enviarte dinero a ti mismo.");
        if (targetUser.bot) return interaction.reply("❌ No puedes enviarle dinero a un bot.");
        if (amount <= 0) return interaction.reply("❌ La cantidad debe ser mayor a 0.");

        const senderData = await getUserData(senderId);

        // 2. Validación de Rango Premium (Opcional, según tu pedido)
        if (!senderData.premiumType || senderData.premiumType === 'normal') {
            return interaction.reply("🌟 Esta función es exclusiva para usuarios **Mensuales** o **Bimestrales**.");
        }

        // 3. Validación de saldo
        if (senderData.wallet < amount) {
            return interaction.reply(`❌ No tienes suficientes flores. Tu saldo actual es de **${senderData.wallet} 🌸**.`);
        }

        // 4. Proceso de transferencia
        const targetData = await getUserData(targetUser.id);

        senderData.wallet -= amount;
        targetData.wallet = (targetData.wallet || 0) + amount;

        await updateUserData(senderId, senderData);
        await updateUserData(targetUser.id, targetData);

        const embed = new EmbedBuilder()
            .setTitle('💸 Transferencia Exitosa')
            .setDescription(`Has enviado **${amount} 🌸** a <@${targetUser.id}>.`)
            .addFields(
                { name: 'Enviado por', value: `${interaction.user.username}`, inline: true },
                { name: 'Recibido por', value: `${targetUser.username}`, inline: true }
            )
            .setColor('#f1c40f')
            .setTimestamp()
            .setFooter({ text: `Tu nuevo saldo: ${senderData.wallet} 🌸` });

        return interaction.reply({ embeds: [embed] });
    }
};