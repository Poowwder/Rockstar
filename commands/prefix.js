const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

// Esquema de Prefijo
const PrefixSchema = new mongoose.Schema({
    GuildID: String,
    Prefix: { type: String, default: '!!' }
});
const PrefixModel = mongoose.models.Prefix || mongoose.model('Prefix', PrefixSchema);

module.exports = {
    name: 'prefix',
    description: '⚙️ Altera la frecuencia de mando (prefijo) en este dominio.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('⚙️ Cambia el prefijo del bot')
        .addStringOption(option => 
            option.setName('nuevo')
                .setDescription('El nuevo prefijo (máx 3 caracteres)')
                .setRequired(true)
                .setMaxLength(3))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // --- ⌨️ EJECUCIÓN POR MENSAJE ---
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('╰┈➤ ❌ Solo los Administradores pueden alterar la frecuencia de mando.');
        }

        const nuevoPrefix = args[0];
        if (!nuevoPrefix) {
            return message.reply("╰┈➤ ⚠️ Indica el nuevo prefijo. Ejemplo: `!!prefix >` ");
        }

        try {
            const oldData = await PrefixModel.findOne({ GuildID: message.guild.id });
            const oldPrefix = oldData ? oldData.Prefix : '!!';

            await PrefixModel.findOneAndUpdate(
                { GuildID: message.guild.id },
                { Prefix: nuevoPrefix },
                { upsert: true }
            );

            message.reply(`╰┈➤ 🌑 Frecuencia alterada. Nuevo prefijo: \`${nuevoPrefix}\``);

            // --- 👁️ LOG AUTOMÁTICO ---
            await sendAuditLog(message.guild, {
                title: '⊹ Alteración de Prefijo ⊹',
                description: 
                    `**Antiguo:** \`${oldPrefix}\`\n` +
                    `**Nuevo:** \`${nuevoPrefix}\`\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `> *La clave de acceso al sistema ha sido modificada.*`,
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error(error);
            message.reply('╰┈➤ ❌ Error al sincronizar con la base de datos.');
        }
    },

    // --- 🚀 EJECUCIÓN POR SLASH ---
    async executeSlash(interaction) {
        const nuevoPrefix = interaction.options.getString('nuevo');
        
        try {
            const oldData = await PrefixModel.findOne({ GuildID: interaction.guild.id });
            const oldPrefix = oldData ? oldData.Prefix : '!!';

            await PrefixModel.findOneAndUpdate(
                { GuildID: interaction.guild.id },
                { Prefix: nuevoPrefix },
                { upsert: true }
            );

            await interaction.reply({ content: `╰┈➤ 🌑 Frecuencia alterada exitosamente a: \`${nuevoPrefix}\``, ephemeral: true });

            // --- 👁️ LOG AUTOMÁTICO ---
            await sendAuditLog(interaction.guild, {
                title: '⊹ Alteración de Prefijo (Slash) ⊹',
                description: 
                    `**Antiguo:** \`${oldPrefix}\`\n` +
                    `**Nuevo:** \`${nuevoPrefix}\`\n` +
                    `**Administrador:** ${interaction.user.tag}\n` +
                    `> *El protocolo de mando ha sido actualizado vía Slash Command.*`,
                color: '#1a1a1a',
                icon: interaction.user.displayAvatarURL()
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '╰┈➤ ❌ Error crítico al actualizar el prefijo.', ephemeral: true });
        }
    }
};
