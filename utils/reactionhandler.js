const { EmbedBuilder } = require('discord.js');

async function runReaction(client, type, user) {
    const reactions = {
        angry: { text: `¡${user.username} está muy enojada! 💢`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        blush: { text: `¡${user.username} se ha sonrojado! 😊`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        boonk: { text: `¡Boonk! ${user.username} apareció de la nada. 💥`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        bored: { text: `A ${user.username} le invade el aburrimiento... 😑`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        bye: { text: `¡${user.username} se despide de todos! 👋`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        confused: { text: `¿Eh? ${user.username} no entiende nada. ❓`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        cringe: { text: `¡A ${user.username} le dio mucho cringe! 😬`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        cry: { text: `¡${user.username} está llorando! 😭`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        dance: { text: `¡Miren cómo baila ${user.username}! 💃`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        dodge: { text: `💨 **${user.username}** lo esquivó con estilo... ¡No me toques, reina! ✨`, gif: 'https://media.tenor.com/v8v8v8v8v8vAAAAC/anime-dodge.gif' },
        grafitti: { text: `¡${user.username} está dejando su marca con un graffiti! 🎨`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        happy: { text: `¡${user.username} irradia felicidad! ✨`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        hi: { text: `¡${user.username} dice hola a todos! 👋`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        laugh: { text: `¡${user.username} no puede parar de reír! 😂`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        paint: { text: `¡${user.username} está pintando una obra maestra! 🖌️`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        panic: { text: `¡${user.username} entró en pánico total! 😱`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        pout: { text: `¡${user.username} está haciendo un puchero! 😤`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        run: { text: `¡${user.username} salió corriendo! 🏃‍♀️`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        scared: { text: `¡${user.username} tiene mucho miedo! 😨`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        shrug: { text: `${user.username} no sabe qué decir... 🤷‍♀️`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        sip: { text: `${user.username} está bebiendo algo tranquilamente. 🥤`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        sleep: { text: `¡Zzz... ${user.username} se quedó dormida! 💤`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        smug: { text: `¡Qué presumida es ${user.username}! 😏`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        thinking: { text: `${user.username} está pensando seriamente... 🤔`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        wave: { text: `¡${user.username} te saluda con la mano! 👋`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        wink: { text: `¡${user.username} te guiñó un ojo! 😉`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        scream: { text: `¡${user.username} está gritando con todas sus fuerzas! 😫`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' },
        yandere: { text: `Cuidado... ${user.username} entró en modo yandere. 🔪`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif' }
    };

    const reaction = reactions[type];

    const embed = new EmbedBuilder()
        .setColor('#FFB6C1')
        .setDescription(reaction.text)
        .setImage(reaction.gif)
        .setFooter({ text: `Reacción de ${user.username}` });

    return { embeds: [embed] };
}

module.exports = { runReaction };