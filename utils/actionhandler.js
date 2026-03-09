const { EmbedBuilder } = require('discord.js');
const actionSchema = require('../models/actionSchema');

async function runAction(client, interaction, type, targetUser, author) {
    // Definición de GIFs y Mensajes
    const dataConfig = {
        hug: { msg: "abrazó muy fuerte a", emoji: "✨", api: "hug" },
        kiss: { msg: "le dio un besito a", emoji: "💖", api: "kiss" },
        slap: { msg: "le dio una cachetada a", emoji: "💢", api: "slap" },
        // ... Agregas todos los demás aquí
    };

    const config = dataConfig[type];
    
    // Lógica del contador
    let dbData = await actionSchema.findOne({ userId: author.id, action: type });
    if (!dbData) dbData = new actionSchema({ userId: author.id, action: type, count: 0 });
    dbData.count++;
    await dbData.save();

    // Obtener GIF (puedes usar nekos.life o tus links directos)
    const res = await fetch(`https://nekos.life/api/v2/img/${config.api}`);
    const json = await res.json();

    const embed = new EmbedBuilder()
        .setDescription(`${config.emoji} **${author.username}** ${config.msg} **${targetUser.username}**...\n\n> 🎀 ¡Ya ha dado **${dbData.count}** ${type}s en total!`)
        .setImage(json.url)
        .setColor('#FFB7C5');

    return { embeds: [embed] };
}

module.exports = { runAction };