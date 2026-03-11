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

    // --- 🖋️ DICCIONARIO DE LAS 28 ACCIONES ---
    const actions = {
        bite: `le ha dado un mordisco a`,
        cuddle: `se acurruca cariñosamente con`,
        feed: `le da de comer un bocado a`,
        handhold: `toma de la mano a`,
        highfive: `choca los cinco con`,
        hug: `envuelve en un gran abrazo a`,
        kick: `le ha soltado una patada a`,
        kiss: `le ha robado un beso a`,
        pat: `acaricia suavemente la cabeza de`,
        poke: `le da unos toquecitos a`,
        punch: `le ha dado un puñetazo a`,
        slap: `le ha cruzado el rostro a`,
        tickle: `desata una ola de cosquillas sobre`,
        yeet: `ha mandado a volar lejos a`,
        shoot: `le ha disparado sin piedad a`,
        kill: `ha terminado con la existencia de`,
        lick: `le da una lamidita a`,
        stare: `observa fijamente a`,
        pout: `le hace un puchero a`,
        bully: `está molestando un poquito a`,
        greet: `le da una bienvenida formal a`,
        bonk: `le ha dado un golpe en la cabeza a`,
        paint: `está pintando un hermoso retrato de`,
        glare: `mira con desprecio y frialdad a`,
        stomp: `está pisoteando con mucha fuerza a`,
        sape: `le ha dado un tremendo sape a`,
        bite: `le clava los colmillos a`,
        punch: `le suelta un derechazo a`
    };

    const actionText = actions[type] || `interactúa con`;
    // Mapeo de API para los que no se llaman igual
    const apiMap = { sape: 'slap', glare: 'stare', stomp: 'kick', paint: 'smile' };
    const apiCategory = apiMap[type] || type;

    let gifUrl = '';
    let animeName = 'Desconocido';

    try {
        const res = await fetch(`https://nekos.best/api/v2/${apiCategory}`);
        const json = await res.json();
        gifUrl = json.results[0].url;
        animeName = json.results[0].anime_name;
    } catch (e) { console.error(e); }

    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${actionText} **${targetMember.displayName}**`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: `Anime: ${animeName}`, iconURL: author.displayAvatarURL({ dynamic: true }) });

    return { embeds: [embed] };
}

module.exports = { runAction };
