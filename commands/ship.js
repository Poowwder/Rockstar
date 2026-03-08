const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ship',
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('💖 Mide la compatibilidad entre dos personas')
        .addUserOption(o => o.setName('u1').setDescription('Primera persona').setRequired(true))
        .addUserOption(o => o.setName('u2').setDescription('Segunda persona')),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user1 = isSlash ? input.options.getUser('u1') : (input.mentions.users.first() || input.author);
        const user2 = isSlash ? (input.options.getUser('u2') || input.user) : (input.mentions.users.entries().next().value?.[1] || input.author);

        if (user1.id === user2.id) return input.reply("╰┈➤ 🌸 **¡Linda!** Ámate a ti misma, pero para el ship mejor elige a alguien más. ✨");

        const lovePercent = Math.floor(Math.random() * 101);
        const heartBar = "💖".repeat(Math.floor(lovePercent / 10)) + "🤍".repeat(10 - Math.floor(lovePercent / 10));
        
        let comment = "¡Una pareja destinada al éxito! ✨";
        if (lovePercent < 30) comment = "Quizás mejor como amigos... ☁️";
        else if (lovePercent < 70) comment = "¡Hay chispas aquí! 🎀";

        const shipEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ 💘 Medidor de Amor Rockstar 💘 ˚₊‧`)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setDescription(
                `*“¿Serán almas gemelas bajo las estrellas?”* ✨\n\n` +
                `**${user1.username}** 💓 **${user2.username}**\n\n` +
                `📊 **Compatibilidad:** \`${lovePercent}%\` \n` +
                `╰┈➤ ${heartBar}\n\n` +
                `*“${comment}”*\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧`
            )
            .setFooter({ text: `Consultado por ${isSlash ? input.user.username : input.author.username} ♡` });

        return input.reply({ embeds: [shipEmbed] });
    }
};