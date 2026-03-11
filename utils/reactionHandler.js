const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

async function runReaction(input, type) {
    const isSlash = !!input.user;
    const author = isSlash ? input.user : input.author;
    const guild = input.guild;

    const authorMember = guild?.members.cache.get(author.id) || { displayName: author.username };
    const e1 = getRndEmoji(guild);

    const reactions = {
        angry: `arde de furia...`, blush: `se sonroja...`, bored: `está aburrido...`,
        cry: `está llorando...`, dance: `se pone a bailar...`, happy: `está muy feliz...`,
        laugh: `se ríe a carcajadas...`, pout: `hace un puchero...`, sleep: `tiene mucho sueño...`,
        smile: `sonríe dulcemente...`, smug: `pone cara de presumido...`, wink: `te guiña un ojo...`,
        shrug: `se encoge de hombros...`, think: `se queda pensando...`, wave: `te saluda con la mano...`
    };

    const text = reactions[type] || `está reaccionando...`;
    const apiCategory = reactions[type] ? type : 'smile';

    let gifUrl = '';
    let animeName = 'Internet';

    try {
        const res = await fetch(`https://nekos.best/api/v2/${apiCategory}`);
        const json = await res.json();
        gifUrl = json.results[0].url;
        animeName = json.results[0].anime_name;
    } catch (e) { 
        console.error("Error API Nekos.best:", e);
        gifUrl = 'https://i.pinimg.com/originals/de/21/6b/de216b677051f50a4f5f5f5f5f5f5f5f.gif';
    }

    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${text}`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Anime: ${animeName}`, iconURL: author.displayAvatarURL({ dynamic: true }) });

    return { embeds: [embed] };
}

module.exports = { runReaction };
