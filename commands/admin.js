const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, updateUserData, grantNeko } = require('../userManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('🛠️ Gestión administrativa de 𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
                .addBooleanOption(opt => opt.setName('estado').setDescription('¿Añadir (True) o Quitar (False)?').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');

        if (sub === 'set_premium') {
            const rango = interaction.options.getString('rango');
            await updateUserData(target.id, { premiumType: rango });
            
            // 👑 Si le das premium, le regalamos a Astra automáticamente
            if (rango !== 'none') {
                await grantNeko(target.id, 'astra', interaction.client);
            }
            
            return interaction.reply({ content: `✨ Rango de **${target.username}** actualizado a: \`${rango.toUpperCase()}\`.`, ephemeral: true });
        }

        if (sub === 'set_neko') {
            const nekoId = interaction.options.getString('neko');
            const estado = interaction.options.getBoolean('estado');
            let data = await getUserData(target.id);
            let misNekos = data.nekos || {};
            misNekos[nekoId] = estado;

            await updateUserData(target.id, { nekos: misNekos });
            return interaction.reply({ content: `🐾 Neko **${nekoId}** -> **${estado ? 'Activado' : 'Desactivado'}** para ${target.username}.`, ephemeral: true });
        }
    }
};