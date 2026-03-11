const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- ✨ EMOJIS AL AZAR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '✨';
};

// --- ⚙️ HANDLER PRINCIPAL ---
async function runReaction(input, type) {
    const isSlash = !!input.user;
    const author = isSlash ? input.user : input.author;
    const guild = input.guild;

    const authorMember = guild ? (guild.members.cache.get(author.id) || { displayName: author.username }) : { displayName: author.username };
    const e1 = getRndEmoji(guild);

    // --- 📜 DICCIONARIO NEUTRAL Y AESTHETIC (Sin Paint) ---
    const reactions = {
        angry: { text: `arde de furia...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/11tTNkNy1SdXGg/giphy.gif' },
        blush: { text: `siente el rubor en sus mejillas...`, fallback: 'https://nekos.best/api/v2/blush/005.gif' },
        boonk: { text: `aparece sorpresivamente de las sombras...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/twPbxe6EWK56U/giphy.gif' },
        bored: { text: `sucumbe ante el vacío del aburrimiento...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        bye: { text: `se despide en la distancia...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        confused: { text: `se pierde en un mar de confusión...`, fallback: 'https://nekos.best/api/v2/confused/001.gif' },
        cringe: { text: `siente una profunda incomodidad...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/3o7TKMGpxx6r1NEX3G/giphy.gif' },
        cry: { text: `derrama lágrimas en silencio...`, fallback: 'https://nekos.best/api/v2/cry/010.gif' },
        dance: { text: `se deja llevar por el ritmo...`, fallback: 'https://nekos.best/api/v2/dance/005.gif' },
        dodge: { text: `esquiva la situación con estilo... ¡Intocable!`, fallback: 'https://media.tenor.com/4E_2kE78I58AAAAC/anime-dodge.gif' },
        grafitti: { text: `plasma su arte en los muros...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/3o7TKMGpxx6r1NEX3G/giphy.gif' },
        happy: { text: `irradia un aura de alegría...`, fallback: 'https://nekos.best/api/v2/happy/002.gif' },
        hi: { text: `hace un gesto de saludo...`, fallback: 'https://nekos.best/api/v2/happy/001.gif' },
        laugh: { text: `rompe el silencio con una carcajada...`, fallback: 'https://nekos.best/api/v2/laugh/001.gif' },
        panic: { text: `entra en un estado de pánico total...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        pout: { text: `hace un leve puchero de inconformidad...`, fallback: 'https://nekos.best/api/v2/pout/001.gif' },
        run: { text: `huye rápidamente de la escena...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/mlvseq9yvZhba/giphy.gif' },
        scared: { text: `siente el peso del terror...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        shrug: { text: `se encoge de hombros sin respuesta...`, fallback: 'https://nekos.best/api/v2/shrug/001.gif' },
        sip: { text: `bebe tranquilamente de su copa...`, fallback: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3J4eHh4eHgmcmlkPWdpcGh5LmdpZg/ROF8OQvD8r09G/giphy.gif' },
        sleep: { text: `cae en un profundo letargo...`, fallback: 'https://nekos.best/api/v2/sleep/001.gif' },
        smug: { text: `muestra una expresión de superioridad...`, fallback: 'https://nekos.best/api/v2/smug/001.gif' },
        thinking: { text: `se sumerge en sus propios pensamientos...`, fallback: 'https://nekos.best/api/v2/think/001.gif' },
        wave: { text: `agita la mano en el aire...`, fallback: 'https://nekos.best/api/v2/wave/001.gif' },
        wink: { text: `dedica un guiño cómplice...`, fallback: 'https://nekos.best/api/v2/wink/001.gif' },
        scream: { text: `libera un grito ensordecedor...`, fallback: 'https://nekos.best/api/v2/scream/001.gif' },
        yandere: { text: `revela su lado más oscuro y obsesivo...`, fallback: 'https://i.pinimg.com/originals/de/21/6b/de216b677051f50a4f5f5f5f5f5f5f5f.gif' },
        dere: { text: `muestra su faceta más tierna y vulnerable...`, fallback: 'https://media.tenor.com/7A9_h1Aat4AAAAAC/anime-love.gif' }
    };

    const reactionData = reactions[type];
    if (!reactionData) return { content: `❌ El archivo \`${type}\` no existe en el sistema.`, ephemeral: true };

    // --- 🖼️ MOTOR DE RUTAS LOCALES SEGURO ---
    const folderPath = path.join(__dirname, '..', 'commands', type.toLowerCase());
    
    let animeName = 'Internet';
    let attachment = null;
    let safeFileName = 'reaction_image.gif'; 

    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.gif') || file.endsWith('.png') || file.endsWith('.jpg'));
            if (files.length > 0) {
                const selectedFile = files[Math.floor(Math.random() * files.length)];
                
                // Extrae el nombre del anime antes del guión bajo, quita guiones normales y capitaliza
                let rawName = selectedFile.split('_')[0];
                animeName = rawName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Extrae extensión y crea el attachment seguro
                const ext = path.extname(selectedFile);
                safeFileName = `reaction_image${ext}`;
                attachment = new AttachmentBuilder(path.join(folderPath, selectedFile), { name: safeFileName });
            }
        }
    } catch (error) {
        console.error(`❌ Error buscando la imagen para ${type}:`, error);
    }

    // --- 📄 EMBED ROCKSTAR ---
    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${reactionData.text}`)
        .setTimestamp()
        .setFooter({ 
            text: `Anime: ${attachment ? animeName : 'Internet'}`, // ✅ FIX: Adiós al "Reacción de X"
            iconURL: author.displayAvatarURL({ dynamic: true }) 
        });

    let responseObj = { embeds: [embed] };

    // Si encontró archivo local, lo incrusta. Si no, usa el link de internet.
    if (attachment) {
        embed.setImage(`attachment://${safeFileName}`);
        responseObj.files = [attachment];
    } else {
        embed.setImage(reactionData.fallback);
    }

    return responseObj;
}

module.exports = { runReaction };
