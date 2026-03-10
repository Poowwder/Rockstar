const { EmbedBuilder } = require('discord.js');

async function runAction(client, type, user, target) {
    // Si el usuario intenta hacerse la acción a sí mismo (opcional)
    if (user.id === target.id) {
        return { content: "¡No puedes hacerte eso a ti misma, loquita! 🐾", ephemeral: true };
    }

    const actions = {
        bite: { text: `¡**${user.username}** le dio un mordisco a **${target.username}**! 🦷`, color: '#FF5555' },
        bully: { text: `¡**${user.username}** está molestando a **${target.username}**! 😈`, color: '#555555' },
        clap: { text: `¡**${user.username}** le aplaude a **${target.username}**! 👏`, color: '#FFFF55' },
        cuddle: { text: `¡**${user.username}** se acurruca tiernamente con **${target.username}**! 💤`, color: '#FFB6C1' },
        feed: { text: `¡**${user.username}** le está dando de comer a **${target.username}**! 🍲`, color: '#FFA500' },
        handhold: { text: `¡**${user.username}** tomó la mano de **${target.username}**! 🤝`, color: '#FFC0CB' },
        highfive: { text: `¡**${user.username}** y **${target.username}** chocaron esos cinco! ✋`, color: '#00FF00' },
        hug: { text: `¡**${user.username}** abrazó fuertemente a **${target.username}**! 🤗`, color: '#87CEEB' },
        kill: { text: `¡**${user.username}** ha acabado con **${target.username}**! 💀`, color: '#000000' },
        kiss: { text: `¡**${user.username}** le dio un beso a **${target.username}**! 💋`, color: '#FF0080' },
        lick: { text: `¡**${user.username}** lamió a **${target.username}**! 👅`, color: '#FF69B4' },
        nom: { text: `¡**${user.username}** le dio un ñam a **${target.username}**! 😋`, color: '#F4A460' },
        pat: { text: `¡**${user.username}** acarició la cabecita de **${target.username}**! ✨`, color: '#FFFACD' },
        poke: { text: `¡**${user.username}** está picando a **${target.username}**! 👉`, color: '#ADD8E6' },
        punch: { text: `¡**${user.username}** le dio un puñetazo a **${target.username}**! 🥊`, color: '#FF4500' },
        shoot: { text: `¡**${user.username}** le disparó a **${target.username}**! 🔫`, color: '#2F4F4F' },
        slap: { text: `¡**${user.username}** le dio una cachetada a **${target.username}**! 🖐️`, color: '#FF0000' },
        spank: { text: `¡**${user.username}** le dio una nalgada a **${target.username}**! 🍑`, color: '#800080' },
        splash: { text: `¡**${user.username}** salpicó de agua a **${target.username}**! 💦`, color: '#0000FF' },
        spray: { text: `¡**${user.username}** roció a **${target.username}**! 💨`, color: '#7FFFD4' },
        stare: { text: `**${user.username}** mira fijamente a **${target.username}**... 👀`, color: '#F0E68C' },
        sue: { text: `¡**${user.username}** demandó legalmente a **${target.username}**! ⚖️`, color: '#708090' },
        tickle: { text: `¡**${user.username}** le hace cosquillas a **${target.username}**! 😂`, color: '#FFD700' },
        yeet: { text: `¡**${user.username}** lanzó a **${target.username}** muy lejos! 🚀`, color: '#00FFFF' }
    };

    const action = actions[type];

    const embed = new EmbedBuilder()
        .setColor(action.color)
        .setDescription(action.text)
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif') // Aquí pon tus GIFs preferidos
        .setFooter({ text: `Acción solicitada por ${user.username}` });

    return { embeds: [embed] };
}

module.exports = { runAction };