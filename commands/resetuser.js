const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateUserData } = require('../userManager.js');

module.exports = {
    name: 'reset',
    data: new SlashCommandBuilder()
        .setName('resetuser')
        .setDescription('🧹 Reinicia los datos de un usuario (Admin Only)')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a reiniciar').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(input) {
        // Solo para administradores
        if (!input.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return input.reply("╰┈➤ ❌ **¡Nop!** Solo las administradoras pueden usar esta magia. ✨");
        }

        const isSlash = !!input.user;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();

        if (!target) return input.reply("╰┈➤ 🌸 **¡Holi!** Menciona a alguien para reiniciar.");

        // Datos iniciales
        const newData = {
            userId: target.id,
            wallet: 0,
            bank: 0,
            level: 1,
            xp: 0,
            inventory: [],
            premiumType: 'normal'
        };

        await updateUserData(target.id, newData);

        const resetEmbed = new EmbedBuilder()
            .setTitle(`🧹 ‧₊˚ Limpieza Mágica ˚₊‧ 🧹`)
            .setColor('#FF9AA2') // Rojo pastel/salmón
            .setThumbnail('https://i.pinimg.com/originals/a0/6c/4a/a06c4a93883a908a8e32918f0f09a18d.gif')
            .setDescription(
                `*“Borrón y cuenta nueva con polvos de hadas...”* ✨\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n` +
                `👤 **Usuario:** \`${target.username}\`\n` +
                `✨ **Acción:** \`Reinicio de cuenta completo\`\n` +
                `✅ **Estado:** \`Éxito total\`\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Los datos han sido purificados!*`
            )
            .setFooter({ text: `Admin: ${input.member.displayName} ♡` });

        return input.reply({ embeds: [resetEmbed] });
    }
};