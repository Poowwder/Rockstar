const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

async function runAction(input, type, targetUser) {
    const isSlash = !!input.user;
    const author = isSlash ? input.user : input.author;
    const guild = input.guild;

    const authorMember = guild?.members.cache.get(author.id) || { displayName: author.username };
    const targetMember = guild?.members.cache.get(targetUser.id) || { displayName: targetUser.username };
    const e1 = getRndEmoji(guild);

    if (author.id === targetUser.id) {
        return { content: `╰┈➤ ${e1} Las sombras no permiten que dirijas esta acción hacia ti mismo.`, ephemeral: true };
    }

    // --- 🖋️ LISTA DE ACCIONES EXTENDIDA ---
    const actions = {
        bite: `ha clavado sus colmillos en`,
        cuddle: `se acurruca con`,
        feed: `le da de comer a`,
        handhold: `entrelaza sus manos con`,
        highfive: `choca los cinco con`,
        hug: `envuelve en un cálido abrazo a`,
        kick: `ha pateado a`,
        kiss: `le ha robado un beso a`,
        pat: `acaricia suavemente a`,
        poke: `le da un toque de atención a`,
        punch: `le ha dado un golpe a`,
        slap: `le ha cruzado el rostro a`,
        tickle: `desata una ola de cosquillas sobre`,
        yeet: `ha mandado a volar lejos a`,
        shoot: `le ha disparado a`, // ✅ AÑADIDO
        kill: `ha terminado con la vida de`, // ✅ AÑADIDO
        stare: `se queda observando fijamente a`, // ✅ AÑADIDO
        punch: `le da un puñetazo a` // ✅ AÑADIDO
    };

    const actionText = actions[type] || `interactúa con`;
    
    // Si la API no tiene la categoría exacta, usamos una parecida
    const apiCategory = actions[type] ? type : 'pat';

    let gifUrl = 'https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif';
    let animeName = 'Desconocido';

    try {
        const res = await fetch(`https://nekos.best/api/v2/${apiCategory}`);
        const json = await res.json();
        gifUrl = json.results[0].url;
        animeName = json.results[0].anime_name;
    } catch (e) { console.error("Error API Nekos.best:", e); }

    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${actionText} **${targetMember.displayName}**`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Anime: ${animeName}`, iconURL: author.displayAvatarURL({ dynamic: true }) });

    return { embeds: [embed] };
}

module.exports = { runAction };
