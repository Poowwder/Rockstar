const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAnimeImage } = require('../waifuApi.js');

// Configuración de comandos de acción
const actions = [
    { name: 'hug', desc: 'Abraza a alguien con mucho cariño.', category: 'hug', text: 'abrazó a' },
    { name: 'kiss', desc: 'Dale un beso a alguien.', category: 'kiss', text: 'besó a' },
    { name: 'pat', desc: 'Acaricia la cabeza de alguien.', category: 'pat', text: 'acarició a' },
    { name: 'slap', desc: 'Abofetea a alguien.', category: 'slap', text: 'abofeteó a' },
    { name: 'kill', desc: 'Acaba con alguien (en rol).', category: 'kill', text: 'mató a' },
    { name: 'cuddle', desc: 'Acurrúcate con alguien.', category: 'cuddle', text: 'se acurrucó con' },
    { name: 'poke', desc: 'Molesta o toca a alguien.', category: 'poke', text: 'le dio un toque a' },
    { name: 'bite', desc: 'Muerde a alguien.', category: 'bite', text: 'mordió a' },
    { name: 'lick', desc: 'Lame a alguien.', category: 'lick', text: 'lamió a' },
    { name: 'bonk', desc: 'Golpea a alguien (bonk).', category: 'bonk', text: 'le dio un bonk a' },
    { name: 'yeet', desc: 'Lanza a alguien lejos.', category: 'yeet', text: 'lanzó a' },
    { name: 'highfive', desc: 'Choca esos cinco.', category: 'highfive', text: 'chocó los cinco con' },
    { name: 'handhold', desc: 'Toma la mano de alguien.', category: 'handhold', text: 'tomó la mano de' },
    { name: 'kick', desc: 'Patea a alguien.', category: 'kick', text: 'pateó a' },
    { name: 'bully', desc: 'Hazle bullying a alguien (broma).', category: 'bully', text: 'le hizo bullying a' },
    { name: 'glomp', desc: 'Abraza a alguien con fuerza.', category: 'glomp', text: 'abrazó con fuerza a' },
    { name: 'punch', desc: 'Dale un puñetazo a alguien.', category: 'punch', text: 'le dio un puñetazo a' }
];

function createActionCommand(config) {
    return {
        data: new SlashCommandBuilder()
            .setName(config.name)
            .setDescription(config.desc)
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('El usuario con el que interactuar')
                    .setRequired(true)
            ),
        skipSlash: true, // No registrar individualmente como slash command
        category: 'action',
        description: config.desc,
        usage: `!!${config.name} <usuario>`,
        async execute(message, args) {
            const target = message.mentions.users.first();
            if (!target) return message.reply('Debes mencionar a alguien.');
            
            await executeAction(message, message.author, target, config);
        }
    };
}

// Comando Maestro /action
const masterActionCommand = {
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('Realiza una acción de rol con otro usuario.')
        .setDMPermission(false),
    category: 'action',
    description: 'Comando principal de acciones de rol.',
    async executeSlash(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('usuario');
        const config = actions.find(a => a.name === subcommand);
        
        if (config) {
            await executeAction(interaction, interaction.user, target, config);
        }
    }
};

// Añadir subcomandos al comando maestro
actions.forEach(action => {
    masterActionCommand.data.addSubcommand(sub => 
        sub.setName(action.name)
           .setDescription(action.desc)
           .addUserOption(opt => opt.setName('usuario').setDescription('El usuario objetivo.').setRequired(true))
    );
});

async function executeAction(ctx, author, target, config) {
    // Manejo de respuesta inicial (defer) para dar tiempo a la API
    if (ctx.isChatInputCommand?.()) await ctx.deferReply();

    const { url, footer } = await getAnimeImage(config.category);
    
    const authorMember = ctx.guild ? await ctx.guild.members.fetch(author.id).catch(() => null) : null;
    const targetMember = ctx.guild ? await ctx.guild.members.fetch(target.id).catch(() => null) : null;

    const authorName = authorMember ? authorMember.displayName : author.username;
    const targetName = targetMember ? targetMember.displayName : target.username;

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
        .setDescription(`**${authorName}** ${config.text} **${targetName}**`)
        .setFooter({ text: footerText, iconURL: footerIcon })
        .setTimestamp();

    // Mensajes especiales si interactúas contigo mismo o el bot
    if (target.id === author.id) {
        embed.setDescription(`**${authorName}** se ${config.text} sí mismo... ¿todo bien?`);
    }

    const payload = { embeds: [embed] };
    
    if (ctx.isChatInputCommand?.()) {
        await ctx.editReply(payload);
    } else {
        await ctx.reply(payload);
    }
}

module.exports = [...actions.map(createActionCommand), masterActionCommand];