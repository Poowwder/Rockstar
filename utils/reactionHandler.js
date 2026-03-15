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
    
    // Aseguramos que el tipo siempre esté en minúsculas para evitar errores (Ej: !!Happy)
    const normalizedType = type.toLowerCase();

    // --- 📜 DICCIONARIO NEUTRAL Y AESTHETIC (Enlaces Blindados) ---
    const reactions = {
        angry: { text: `arde de furia...`, fallback: 'https://media.tenor.com/fA15XyE915wAAAAC/anime-angry.gif' },
        blush: { text: `siente el rubor en sus mejillas...`, fallback: 'https://media.tenor.com/2cRtdw0B_hIAAAAC/anime-blush.gif' },
        boonk: { text: `aparece sorpresivamente de las sombras...`, fallback: 'https://media.tenor.com/b2mI_iE-1p8AAAAC/anime-surprise.gif' },
        bored: { text: `sucumbe ante el vacío del aburrimiento...`, fallback: 'https://media.tenor.com/rE5_P_hR_5oAAAAC/anime-bored.gif' },
        bye: { text: `se despide en la distancia...`, fallback: 'https://media.tenor.com/M5Q_OIKB58wAAAAC/anime-bye.gif' },
        confused: { text: `se pierde en un mar de confusión...`, fallback: 'https://media.tenor.com/T_iCgR3Jp28AAAAC/anime-confused.gif' },
        cringe: { text: `siente una profunda incomodidad...`, fallback: 'https://media.tenor.com/pZqP039b-eYAAAAC/anime-cringe.gif' },
        cry: { text: `derrama lágrimas en silencio...`, fallback: 'https://media.tenor.com/2sB7zWJzY1EAAAAC/anime-crying.gif' },
        dance: { text: `se deja llevar por el ritmo...`, fallback: 'https://media.tenor.com/tZ2Xd8LqWmMAAAAC/dance-anime.gif' },
        dodge: { text: `esquiva la situación con estilo... ¡Intocable!`, fallback: 'https://media.tenor.com/4E_2kE78I58AAAAC/anime-dodge.gif' },
        grafitti: { text: `plasma su arte en los muros...`, fallback: 'https://media.tenor.com/w9Uu1Y3Z8sYAAAAC/anime-drawing.gif' },
        happy: { text: `irradia un aura de alegría...`, fallback: 'https://media.tenor.com/nJgq7h0Q4_UAAAAC/anime-happy.gif' },
        hi: { text: `hace un gesto de saludo...`, fallback: 'https://media.tenor.com/717M-j98H7AAAAAC/anime-wave.gif' },
        laugh: { text: `rompe el silencio con una carcajada...`, fallback: 'https://media.tenor.com/yGfM5E-F3hAAAAAC/anime-laugh.gif' },
        panic: { text: `entra en un estado de pánico total...`, fallback: 'https://media.tenor.com/9C0D08bUo3UAAAAC/anime-panic.gif' },
        pout: { text: `hace un leve puchero de inconformidad...`, fallback: 'https://media.tenor.com/Lrt-6rZ2tIEAAAAC/anime-pout.gif' },
        run: { text: `huye rápidamente de la escena...`, fallback: 'https://media.tenor.com/PZ7sHlZt0yAAAAAC/anime-run.gif' },
        scared: { text: `siente el peso del terror...`, fallback: 'https://media.tenor.com/J-0Zf97w53MAAAAC/anime-scared.gif' },
        shrug: { text: `se encoge de hombros sin respuesta...`, fallback: 'https://media.tenor.com/1GgbvY58uF8AAAAC/anime-shrug.gif' },
        sip: { text: `bebe tranquilamente de su copa...`, fallback: 'https://media.tenor.com/2A7fJ9m_nJQAAAAC/anime-sip.gif' },
        sleep: { text: `cae en un profundo letargo...`, fallback: 'https://media.tenor.com/5u9gI_K4-T8AAAAC/anime-sleep.gif' },
        smug: { text: `muestra una expresión de superioridad...`, fallback: 'https://media.tenor.com/JjM0uB0B3C0AAAAC/anime-smug.gif' },
        thinking: { text: `se sumerge en sus propios pensamientos...`, fallback: 'https://media.tenor.com/A623tEeb84YAAAAC/anime-thinking.gif' },
        wave: { text: `agita la mano en el aire...`, fallback: 'https://media.tenor.com/YwN3i8aNqHAAAAAC/anime-wave.gif' },
        wink: { text: `dedica un guiño cómplice...`, fallback: 'https://media.tenor.com/vHqjM0p3GQQAAAAC/anime-wink.gif' },
        scream: { text: `libera un grito ensordecedor...`, fallback: 'https://media.tenor.com/N8J-pXw6lKAAAAAC/anime-scream.gif' },
        yandere: { text: `revela su lado más oscuro y obsesivo...`, fallback: 'https://i.pinimg.com/originals/de/21/6b/de216b677051f50a4f5f5f5f5f5f5f.gif' },
        dere: { text: `muestra su faceta más tierna y vulnerable...`, fallback: 'https://media.tenor.com/7A9_h1Aat4AAAAAC/anime-love.gif' }
    };

    const reactionData = reactions[normalizedType];
    if (!reactionData) return { content: `╰┈➤ ❌ El archivo \`${normalizedType}\` no existe en el sistema.`, ephemeral: true };

    // --- 🖼️ MOTOR DE BÚSQUEDA MULTI-NIVEL ---
    const folderPath = path.join(__dirname, '..', 'commands', normalizedType);
    let finalImageUrl = reactionData.fallback;
    let finalAnimeName = 'Internet';
    let attachment = null;
    let safeFileName = 'reaction_image.gif'; 

    // Nivel 1: Archivos Locales (Tus carpetas personalizadas)
    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath).filter(file => file.match(/\.(gif|png|jpg)$/i));
            if (files.length > 0) {
                const selectedFile = files[Math.floor(Math.random() * files.length)];
                
                let rawName = selectedFile.split('_')[0];
                finalAnimeName = rawName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                const ext = path.extname(selectedFile);
                safeFileName = `reaction_image${ext}`;
                attachment = new AttachmentBuilder(path.join(folderPath, selectedFile), { name: safeFileName });
            }
        }
    } catch (error) { console.error(`❌ Error leyendo archivos locales:`, error); }

    // Nivel 2: API Dinámica Aleatoria (Si no hay imágenes locales)
    if (!attachment) {
        try {
            // Convertimos algunos comandos al formato que entiende la API de nekos.best
            const apiEndpoints = ['blush', 'bored', 'cry', 'dance', 'happy', 'laugh', 'pout', 'shrug', 'sleep', 'smug', 'thinking', 'wave', 'wink'];
            const endpoint = (normalizedType === 'hi' || normalizedType === 'bye') ? 'wave' : normalizedType;

            if (apiEndpoints.includes(endpoint)) {
                const response = await fetch(`https://nekos.best/api/v2/${endpoint}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        finalImageUrl = data.results[0].url; // GIF fresco y nuevo
                        finalAnimeName = data.results[0].anime_name; // Nombre real del anime
                    }
                }
            }
        } catch (error) { 
            // Si la API cae, lo ignoramos silenciosamente y se usará el fallback de Tenor
        }
    }

    // --- 📄 ENSAMBLAJE DEL EMBED ROCKSTAR ---
    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${reactionData.text}`)
        .setTimestamp()
        .setFooter({ 
            text: `Anime: ${finalAnimeName}`, 
            iconURL: author.displayAvatarURL({ dynamic: true }) 
        });

    let responseObj = { embeds: [embed] };

    // Asignación de imagen definitiva
    if (attachment) {
        embed.setImage(`attachment://${safeFileName}`);
        responseObj.files = [attachment];
    } else {
        embed.setImage(finalImageUrl);
    }

    return responseObj;
}

module.exports = { runReaction };
