const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, grantNeko } = require('../userManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('🛠️ Gestión administrativa de 𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // --- SUBCOMANDO: PREMIUM ---
        .addSubcommand(sub =>
            sub.setName('set_premium')
                .setDescription('Asignar rango Premium')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(opt => opt.setName('rango').setDescription('Tipo de suscripción').setRequired(true)
                    .addChoices(
                        { name: 'Pro ✨', value: 'pro' },
                        { name: 'Ultra 💎', value: 'ultra' },
                        { name: 'Ninguno ❌', value: 'none' }
                    )))
        // --- SUBCOMANDO: NEKO ---
        .addSubcommand(sub =>
            sub.setName('set_neko')
                .setDescription('🎀 Dar o quitar un Neko de colección')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(opt => opt.setName('neko').setDescription('El Neko a gestionar').setRequired(true)
                    .addChoices(
                        { name: 'Solas ☁️', value: 'solas' },
                        { name: 'Nyx 🌑', value: 'nyx' },
                        { name: 'Mizuki 🌸', value: 'mizuki' },
                        { name: 'Astra 👑', value: 'astra' },
                        { name: 'Koko 🍓', value: 'koko' }
                    ))
                .addBooleanOption(opt => opt.setName('estado').setDescription('¿Añadir (True) o Quitar (False)?').setRequired(true)))
        // --- SUBCOMANDO: BALANCE ---
        .addSubcommand(sub =>
            sub.setName('set_balance')
                .setDescription('💰 Ajustar economía de un usuario')
                .addUserOption(opt => opt.setName('usuario').setDescription('El usuario').setRequired(true))
                .addIntegerOption(opt => opt.setName('wallet').setDescription('Flores en mano').setRequired(false))
                .addIntegerOption(opt => opt.setName('bank').setDescription('Flores en banco').setRequired(false))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');

        // --- 👑 GESTIÓN PREMIUM ---
        if (sub === 'set_premium') {
            const rango = interaction.options.getString('rango');
            await updateUserData(target.id, { premiumType: rango });
            
            if (rango !== 'none') {
                try {
                    await grantNeko(target.id, 'astra', interaction.client);
                } catch (e) { console.log("Error dando Neko automático."); }
            }
            
            return interaction.reply({ content: `✅ Rango de **${target.username}** establecido en: \`${rango.toUpperCase()}\`.`, ephemeral: true });
        }

        // --- 🐾 GESTIÓN NEKO ---
        if (sub === 'set_neko') {
            const nekoId = interaction.options.getString('neko');
            const estado = interaction.options.getBoolean('estado');
            let data = await getUserData(target.id);
            
            // Forzar actualización de objeto anidado para MongoDB
            let misNekos = data.nekos ? { ...data.nekos } : {};
            misNekos[nekoId] = estado;

            await updateUserData(target.id, { nekos: misNekos });
            return interaction.reply({ content: `🐾 Neko **${nekoId.toUpperCase()}** -> **${estado ? 'OTORGADO' : 'RETIRADO'}** para ${target.username}.`, ephemeral: true });
        }

        // --- 💰 GESTIÓN ECONOMÍA ---
        if (sub === 'set_balance') {
            const wallet = interaction.options.getInteger('wallet');
            const bank = interaction.options.getInteger('bank');
            let updates = {};

            if (wallet !== null) updates.wallet = wallet;
            if (bank !== null) updates.bank = bank;

            if (Object.keys(updates).length === 0) {
                return interaction.reply({ content: `⚠️ Debes especificar al menos un valor (Wallet o Bank).`, ephemeral: true });
            }

            await updateUserData(target.id, updates);

            const embed = new EmbedBuilder()
                .setTitle('⚖️ Ajuste de Cuentas Admin')
                .setColor('#1a1a1a')
                .setDescription(`Se han actualizado los fondos de **${target.username}**.`)
                .addFields(
                    { name: 'Cartera', value: wallet !== null ? `\`${wallet.toLocaleString()}\` 🌸` : 'Sin cambios', inline: true },
                    { name: 'Bóveda', value: bank !== null ? `\`${bank.toLocaleString()}\` 🌸` : 'Sin cambios', inline: true }
                );

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
