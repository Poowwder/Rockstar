const { 
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, 
    ChannelType, MessageFlags 
} = require('discord.js');
const ms = require('ms');
const { GuildConfig, Warning } = require('../data/mongodb.js'); // Núcleo de datos
const { sendAuditLog } = require('../functions/auditLogger.js'); // Ojo del sistema

module.exports = {
    name: 'moderation',
    description: 'Nivel Superior: Panel administrativo de Rockstar Nightfall.',
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('👑 Comandos de moderación avanzada')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        
        // --- SUBCOMANDOS DE EXILIO ---
        .addSubcommand(s => s.setName('ban').setDescription('Exilia a un alma del dominio.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a exiliar').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Motivo del exilio')))
        .addSubcommand(s => s.setName('unban').setDescription('Revoca un exilio mediante ID.').addStringOption(o => o.setName('id').setDescription('ID del alma exiliada').setRequired(true)))
        .addSubcommand(s => s.setName('kick').setDescription('Expulsa a un usuario del servidor.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a expulsar').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Motivo de la expulsión')))
        
        // --- SUBCOMANDOS DE SILENCIO ---
        .addSubcommand(s => s.setName('mute').setDescription('Aplica un bozal mediante rol.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a silenciar').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('Ej: 10m, 1h, 1d')).addStringOption(o => o.setName('razon').setDescription('Motivo del silencio')))
        .addSubcommand(s => s.setName('unmute').setDescription('Restaura la voz de un usuario.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a restaurar').setRequired(true)))
        .addSubcommand(s => s.setName('timeout').setDescription('Aislamiento temporal nativo.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a aislar').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('Ej: 1h, 1d').setRequired(true)))
        .addSubcommand(s => s.setName('untimeout').setDescription('Revoca el aislamiento temporal.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a liberar').setRequired(true)))
        
        // --- SUBCOMANDOS DE EXPEDIENTE ---
        .addSubcommand(s => s.setName('warn').setDescription('Registra una advertencia.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a advertir').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Motivo').setRequired(true)))
        .addSubcommand(s => s.setName('warns').setDescription('Consulta el expediente de un sujeto.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a consultar').setRequired(true)))
        .addSubcommand(s => s.setName('clearwarns').setDescription('Purga el historial de advertencias.').addUserOption(o => o.setName('usuario').setDescription('Sujeto a limpiar').setRequired(true)))
        
        // --- SUBCOMANDOS DE CANAL ---
        .addSubcommand(s => s.setName('purge').setDescription('Incinera mensajes en masa.').addIntegerOption(o => o.setName('cantidad').setDescription('1-100 mensajes').setRequired(true)))
        .addSubcommand(s => s.setName('nuke').setDescription('Erradica y recrea el canal actual.'))
        .addSubcommand(s => s.setName('lock').setDescription('Sella el canal actual.'))
        .addSubcommand(s => s.setName('unlock').setDescription('Rompe el sello del canal.'))
        
        // --- CONFIGURACIÓN ---
        .addSubcommand(s => s.setName('setlogs').setDescription('Vincula el núcleo de auditoría.').addChannelOption(o => o.setName('canal').setDescription('Canal de auditoría').addChannelTypes(ChannelType.GuildText).setRequired(true))),

    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        const { guild, member: modMember, user: modUser } = interaction;

        // --- 1. BAN / KICK / UNBAN ---
        if (['ban', 'kick', 'unban'].includes(sub)) {
            if (sub === 'unban') {
                const id = interaction.options.getString('id');
                return guild.members.unban(id)
