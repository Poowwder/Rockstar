const { EmbedBuilder } = require('discord.js');

async function runReaction(client, type, user) {
    const reactions = {
        angry: { text: `¡${user.username} está muy enojada! 💢`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/11tTNkNy1SdXGg/giphy.gif' },
        blush: { text: `¡${user.username} se ha sonrojado! 😊`, gif: 'https://nekos.best/api/v2/blush/005.gif' },
        boonk: { text: `¡Boonk! ${user.username} apareció de la nada. 💥`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/twPbxe6EWK56U/giphy.gif' },
        bored: { text: `A ${user.username} le invade el aburrimiento... 😑`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        bye: { text: `¡${user.username} se despide de todos! 👋`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        confused: { text: `¿Eh? ${user.username} no entiende nada. ❓`, gif: 'https://nekos.best/api/v2/confused/001.gif' },
        cringe: { text: `¡A ${user.username} le dio mucho cringe! 😬`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/3o7TKMGpxx6r1NEX3G/giphy.gif' },
        cry: { text: `¡${user.username} está llorando! 😭`, gif: 'https://nekos.best/api/v2/cry/010.gif' },
        dance: { text: `¡Miren cómo baila ${user.username}! 💃`, gif: 'https://nekos.best/api/v2/dance/005.gif' },
        dodge: { text: `💨 **${user.username}** lo esquivó con estilo... ¡No me toques, reina! ✨`, gif: 'https://media.tenor.com/4E_2kE78I58AAAAC/anime-dodge.gif' },
        grafitti: { text: `¡${user.username} está dejando su marca con un graffiti! 🎨`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/3o7TKMGpxx6r1NEX3G/giphy.gif' },
        happy: { text: `¡${user.username} irradia felicidad! ✨`, gif: 'https://nekos.best/api/v2/happy/002.gif' },
        hi: { text: `¡${user.username} dice hola a todos! 👋`, gif: 'https://nekos.best/api/v2/happy/001.gif' },
        laugh: { text: `¡${user.username} no puede parar de reír! 😂`, gif: 'https://nekos.best/api/v2/laugh/001.gif' },
        paint: { text: `¡${user.username} está pintando una obra maestra! 🖌️`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/3o7TKMGpxx6r1NEX3G/giphy.gif' },
        panic: { text: `¡${user.username} entró en pánico total! 😱`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        pout: { text: `¡${user.username} está haciendo un puchero! 😤`, gif: 'https://nekos.best/api/v2/pout/001.gif' },
        run: { text: `¡${user.username} salió corriendo! 🏃‍♀️`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        scared: { text: `¡${user.username} tiene mucho miedo! 😨`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        shrug: { text: `${user.username} no sabe qué decir... 🤷‍♀️`, gif: 'https://nekos.best/api/v2/shrug/001.gif' },
        sip: { text: `${user.username} está bebiendo algo tranquilamente. 🥤`, gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        sleep: { text: `¡Zzz... ${user.username} se quedó dormida! 💤`, gif: 'https://nekos.best/api/v2/sleep/001.gif' },
        smug: { text: `¡Qué presumida es ${user.username}! 😏`, gif: 'https://nekos.best/api/v2/smug/001.gif' },
        thinking: { text: `${user.username} está pensando seriamente... 🤔`, gif: 'https://nekos.best/api/v2/think/001.gif' },
        wave: { text: `¡${user.username} te saluda con la mano! 👋`, gif: 'https://nekos.best/api/v2/wave/001.gif' },
        wink: { text: `¡${user.username} te guiñó un ojo! 😉`, gif: 'https://nekos.best/api/v2/wink/001.gif' },
        scream: { text: `¡${user.username} está gritando con todas sus fuerzas! 😫`, gif: 'https://nekos.best/api/v2/scream/001.gif' },
        yandere: { text: `Cuidado... ${user.username} entró en modo yandere. 🔪`, gif: 'https://i.pinimg.com/originals/de/21/6b/de216b677051f50a4f5f5f5f5f5f5f5f.gif' },
        dere: { text: `💖 ¡${user.username} está en su modo más tierno y enamorado! ✨`, gif: 'https://media.tenor.com/7A9_h1Aat4AAAAAC/anime-love.gif' }
    };

    const reaction = reactions[type];

    // Verificación de seguridad por si el tipo no existe
    if (!reaction) {
        return { content: `❌ La reacción \`${type}\` no existe.`, ephemeral: true };
    }

    const embed = new EmbedBuilder()
        .setColor('#FFB6C1')
        .setDescription(reaction.text)
        .setImage(reaction.gif)
        .setFooter({ text: `Reacción de ${user.username}`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    return { embeds: [embed] };
}

module.exports = { runReaction };
