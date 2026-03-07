const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown } = require('../../economyManager.js'); // Ajusta la ruta si es necesario

const ICONS = {
    money: '🌸',
    error: '❌',
    rob: '😈',
};
const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Intenta robar a otro usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a robar.').setRequired(true)),
    category: 'currency',
    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;
        const target = interaction.options.getUser('usuario');
        if (target.bot) return interaction.reply({ content: `${ICONS.error} No puedes robar a un bot.`, flags: MessageFlags.Ephemeral });

        const cooldown = checkAndSetCooldown(userId, 'rob', 1800); // 30 minutos
        if (cooldown > 0) {
            return interaction.reply({ content: `Debes esperar ${cooldown} segundos para volver a robar.`, flags: MessageFlags.Ephemeral });
        }

        const data = getUserData(userId);
        const targetData = getUserData(target.id);

        if (targetData.wallet <= 0) {
            return interaction.reply({ content: `${ICONS.error} ${target.username} no tiene dinero para robar.`, flags: MessageFlags.Ephemeral });
        }

        const chance = Math.random();
        const robSuccess = chance > 0.5; // 50% de éxito

        if (robSuccess) {
            const amount = Math.floor(Math.random() * targetData.wallet * 0.2); // Roba hasta el 20%
            targetData.wallet -= amount;
            data.wallet += amount;

            updateUserData(userId, data);
            updateUserData(target.id, targetData);

            const embed = new EmbedBuilder()
                .setTitle(`${ICONS.rob} ¡Robo Exitoso!`)
                .setDescription(`Robaste ${amount} R☆coins a ${target.username}.`)
                .setColor(COLORS.primary);
            await interaction.reply({ embeds: [embed] });
        } else {
            const fine = Math.floor(data.wallet * 0.1);
            data.wallet -= fine;
            updateUserData(userId, data);

            const embed = new EmbedBuilder()
                .setTitle(`${ICONS.error} ¡Robo Fallido!`)
                .setDescription(`Fallaste al robar a ${target.username} y has pagado una multa de ${fine} R☆coins.`)
                .setColor(COLORS.error);
            await interaction.reply({ embeds: [embed] });
        }
    },
};