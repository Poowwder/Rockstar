const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAnimeImage } = require('../waifuApi.js');

// Configuración de comandos de reacción
const reactions = [
    { name: 'cry', desc: 'Llora desconsoladamente.', category: 'cry', text: 'está llorando' },
    { name: 'laugh', desc: 'Ríete a carcajadas.', category: 'happy', text: 'se está riendo' }, // 'happy' suele funcionar para risa
    { name: 'blush', desc: 'Sonrójate.', category: 'blush', text: 'se sonrojó' },
    { name: 'smile', desc: 'Sonríe alegremente.', category: 'smile', text: 'está sonriendo' },
    { name: 'smug', desc: 'Pon cara de presumido/a.', category: 'smug', text: 'puso cara de presumido/a' },
    { name: 'dance', desc: 'Ponte a bailar.', category: 'dance', text: 'está bailando' },
    { name: 'wink', desc: 'Guiña el ojo.', category: 'wink', text: 'guiñó el ojo' },
    { name: 'wave', desc: 'Saluda con la mano.', category: 'wave', text: 'está saludando' },
    { name: 'cringe', desc: 'Expresa vergüenza ajena.', category: 'cringe', text: 'sintió cringe' },
    { name: 'nom', desc: 'Come algo rico.', category: 'nom', text: 'está comiendo' },
    { name: 'happy', desc: 'Muestra felicidad.', category: 'happy', text: 'está muy feliz' },
    { name: 'awoo', desc: 'Aúlla como un lobo.', category: 'awoo', text: 'está aullando' },
    { name: 'scream', desc: 'Grita de miedo o emoción.', category: 'scream', text: 'está gritando' },
    { name: 'megumin', desc: '¡EXPLOSIÓN!', category: 'megumin', text: 'invocó una ¡EXPLOSIÓN!' }
];

function createReactionCommand(config) {
    return {
        data: new SlashCommandBuilder()
            .setName(config.name)
            .setDescription(config.desc)
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('Usuario al que dirigir la reacción (opcional)')
                    .setRequired(false)
            ),
        skipSlash: true, // No registrar individualmente
        category: 'reaction',
        description: config.desc,
        usage: `!!${config.name} [usuario]`,
        async execute(message, args) {
            const target = message.mentions.users.first();
            await executeReaction(message, message.author, target, config);
        }
    };
}

// Comando Maestro /reaction
const masterReactionCommand = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Expresa una reacción (anime).')
        .setDMPermission(false),
    category: 'reaction',
    description: 'Comando principal de reacciones.',
    async executeSlash(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');
        const config = reactions.find(r => r.name === subcommand);

        if (config) {
            await executeReaction(interaction, interaction.user, target, config);
        }
    }
};

// Añadir subcomandos
reactions.forEach(reaction => {
    masterReactionCommand.data.addSubcommand(sub => 
        sub.setName(reaction.name)
           .setDescription(reaction.desc)
           .addUserOption(opt => opt.setName('usuario').setDescription('Usuario objetivo (opcional).'))
    );
});

async function executeReaction(ctx, author, target, config) {
    if (ctx.isChatInputCommand?.()) await ctx.deferReply();

    const { url, footer } = await getAnimeImage(config.category);
    
    const authorMember = ctx.guild ? await ctx.guild.members.fetch(author.id).catch(() => null) : null;
    const authorName = authorMember ? authorMember.displayName : author.username;

    let footerText;
    let footerIcon = null;
    if (footer) {
        footerText = `Anime: ${footer}`;
    } else {
        footerText = ctx.guild.name;
        footerIcon = ctx.guild.iconURL();
    }

    const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xFFFFFF))
        .setImage(url)
        .setFooter({ text: footerText, iconURL: footerIcon })
        .setTimestamp();

    if (target) {
        const targetMember = ctx.guild ? await ctx.guild.members.fetch(target.id).catch(() => null) : null;
        const targetName = targetMember ? targetMember.displayName : target.username;

        // Si hay un objetivo, adaptamos el texto
        let actionText = config.text;
        // Ajustes gramaticales simples para que suene mejor con objetivo
        if (config.name === 'wave') actionText = 'le saludó a';
        else if (config.name === 'wink') actionText = 'le guiñó el ojo a';
        else if (config.name === 'smile') actionText = 'le sonrió a';
        else if (config.name === 'cry') actionText = 'llora por';
        else if (config.name === 'laugh') actionText = 'se ríe de';
        else if (config.name === 'awoo') actionText = 'le aulló a';
        else if (config.name === 'scream') actionText = 'le gritó a';
        else actionText = `${config.text} ante`; // Default genérico

        embed.setDescription(`**${authorName}** ${actionText} **${targetName}**`);
    } else {
        // Sin objetivo
        embed.setDescription(`**${authorName}** ${config.text}`);
    }

    const payload = { embeds: [embed] };
    
    if (ctx.isChatInputCommand?.()) {
        await ctx.editReply(payload);
    } else {
        await ctx.reply(payload);
    }
}

module.exports = [...reactions.map(createReactionCommand), masterReactionCommand];