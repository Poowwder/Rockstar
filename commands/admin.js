const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Comandos de gestión administrativa')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo Admins
        // Subcomando: Gestionar Dinero
        .addSubcommand(sub =>
            sub.setName('money')
                .setDescription('Dar o quitar dinero a un usuario')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad (negativo para quitar)').setRequired(true)))
        // Subcomando: Gestionar Materiales
        .addSubcommand(sub =>
            sub.setName('give_material')
                .setDescription('Dar materiales a un usuario')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(opt => opt.setName('material').setDescription('Tipo de material').setRequired(true)
                    .addChoices(
                        { name: 'Madera', value: 'madera' },
                        { name: 'Hierro', value: 'hierro' },
                        { name: 'Oro', value: 'oro' },
                        { name: 'Diamante', value: 'diamante' },
                        { name: 'Amuleto', value: 'amuleto_proteccion' }
                    ))
                .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true)))
        // Subcomando: Set Premium
        .addSubcommand(sub =>
            sub.setName('set_premium')
                .setDescription('Asignar rango Premium manualmente')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(opt => opt.setName('tier').setDescription('Rango').setRequired(true)
                    .addChoices(
                        { name: 'Pro', value: 'pro' },
                        { name: 'Ultra', value: 'ultra' }
                    ))
                .addIntegerOption(opt => opt.setName('dias').setDescription('Días de duración').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');
        const data = await getUserData(target.id);

        if (sub === 'money') {
            const cantidad = interaction.options.getInteger('cantidad');
            data.wallet += cantidad;
            await updateUserData(target.id, data);
            return interaction.reply(`✅ Se han ajustado **${cantidad} 🌸** a la cuenta de ${target}.`);
        }

        if (sub === 'give_material') {
            const mat = interaction.options.getString('material');
            const cant = interaction.options.getInteger('cantidad');
            data.inventory[mat] = (data.inventory[mat] || 0) + cant;
            await updateUserData(target.id, data);
            return interaction.reply(`✅ Se han dado **${cant}x ${mat}** a ${target}.`);
        }

        if (sub === 'set_premium') {
            const tier = interaction.options.getString('tier');
            const dias = interaction.options.getInteger('dias');
            const duration = Date.now() + (dias * 24 * 60 * 60 * 1000);

            data.subscription = {
                active: true,
                tier: tier,
                expiresAt: duration
            };

            await updateUserData(target.id, data);
            return interaction.reply(`✨ ${target} ahora es **PREMIUM ${tier.toUpperCase()}** por ${dias} días.`);
        }
    }
};