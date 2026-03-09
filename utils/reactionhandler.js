const { EmbedBuilder } = require('discord.js');
const actionSchema = require('../models/actionSchema');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function runReaction(client, type, author) {
    const dataConfig = {
        happy: { msg: "está irradiando felicidad hoy... ¡Qué linda! ✨", emoji: "🌸", api: "happy" },
        cry: { msg: "está llorando... ¡Alguien dele un abrazo! 🥺", emoji: "💧", api: "cry" },
        angry: { msg: "está muy molesta... ¡Mejor denle su espacio! 💢", emoji: "💢", api: "angry" },
        blush: { msg: "se ha sonrojado mucho... ¡Qué tierna! 😳", emoji: "😳", api: "smug" },
        dance: { msg: "está sacando sus mejores pasos... ¡Esa es mi reina! 💃", emoji: "💃", api: "dance" },
        laugh: { msg: "no puede parar de reír... ¡Qué alegría! 😂", emoji: "😂", api: "laugh" },
        sleep: { msg: "se ha quedado dormida... ¡Shhh! 😴", emoji: "😴", api: "sleep" },
        smug: { msg: "se siente muy superior hoy... 😏", emoji: "😏", api: "smug" },
        thinking: { msg: "está pensando seriamente... 🤔", emoji: "🤔", api: "thinking" },
        bored: { msg: "se muere de aburrimiento... 😴", emoji: "🥱", api: "bored" }
    };

    const config = dataConfig[type];
    
    // Lógica del contador (usamos el mismo schema de antes)
    let dbData = await actionSchema.findOne({ userId: author.id, action: type });
    if (!dbData) dbData = new actionSchema({ userId: author.id, action: type, count: 0 });
    dbData.count++;
    await dbData.save();

    // Obtener GIF de una API o links estables
    let gifUrl;
    try {
        const res = await fetch(`https://nekos.life/api/v2/img/${config.api}`);
        const json = await res.json();
        gifUrl = json.url;
    } catch {
        gifUrl = "https://media.tenor.com/7P7S9X9v_YAAAAC/anime-wave.gif"; // Fallback
    }

    const embed = new EmbedBuilder()
        .setDescription(`${config.emoji} **${author.username}** ${config.msg}\n\n> 🎀 Ha reaccionado así **${dbData.count}** veces en total.`)
        .setImage(gifUrl)
        .setColor('#FFB7C5');

    return { embeds: [embed] };
}

module.exports = { runReaction };