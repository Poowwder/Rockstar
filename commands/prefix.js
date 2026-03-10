const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Definimos un esquema rápido para el prefijo (puedes moverlo a un archivo de models luego)
const PrefixSchema = new mongoose.Schema({
    GuildID: String,
    Prefix: { type: String, default: '!!' }
});
const PrefixModel = mongoose.models.Prefix || mongoose.model('Prefix', PrefixSchema);

module.exports = {
    name: 'prefix',
    description: '⚙️ Cambia el prefijo del bot en este servidor.',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('⚙️ Cambia el prefijo del bot')
        .addStringOption(option => 
            option.setName('nuevo')
                .setDescription('El nuevo prefijo (ej: >, ., $)')
                .setRequired(true)
                .setMaxLength(3))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const nuevoPrefix = args[0];
        if (!nuevoPrefix) return message.reply("❌ Indica el nuevo prefijo. Ejemplo: `!!prefix >` ");
        
        await PrefixModel.findOneAndUpdate(
            { GuildID: message.guild.id },
            { Prefix: nuevoPrefix },
            { upsert: true }
        );

        message.reply(`✅ Prefijo actualizado a: \`${nuevoPrefix}\``);
    },

    async executeSlash(interaction) {
        const nuevoPrefix = interaction.options.getString('nuevo');
        
        await PrefixModel.findOneAndUpdate(
            { GuildID: interaction.guild.id },
            { Prefix: nuevoPrefix },
            { upsert: true }
        );

        await interaction.reply(`✅ El prefijo ahora es: \`${nuevoPrefix}\``);
    }
};