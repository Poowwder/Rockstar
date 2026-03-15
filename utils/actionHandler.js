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
async function runAction(input, type, targetUser) {
    const isSlash = !!input.user;
    const author = isSlash ? input.user : input.author;
    const guild = input.guild;

    const authorMember = guild?.members.cache.get(author.id) || { displayName: author.username };
    const targetMember = guild?.members.cache.get(targetUser.id) || { displayName: targetUser.username };

    const e1 = getRndEmoji(guild);
    const e2 = getRndEmoji(guild);

    // --- 🛡️ AUTO-ACCIÓN ---
    if (author.id === targetUser.id) {
        return { 
            content: `╰┈➤ ❌ ${e1} Las sombras no permiten que dirijas esta acción hacia tu propia persona.`, 
            ephemeral: true 
        };
    }

    const normalizedType = type.toLowerCase();

    // --- 📜 DICCIONARIO NEUTRAL Y AESTHETIC (Con enlaces blindados) ---
    const actions = {
        bite: { text: `ha clavado sus colmillos en`, fallback: 'https://media.tenor.com/1-qI-I4yHbcAAAAC/anime-bite.gif' },
        bully: { text: `ha decidido atormentar a`, fallback: 'https://media.tenor.com/E0n_2Z9vRjQAAAAC/anime-bully.gif' },
        clap: { text: `celebra con aplausos la presencia de`, fallback: 'https://media.tenor.com/1f_eO_eH7ZcAAAAC/anime-clap.gif' },
        cuddle: { text: `comparte un momento íntimo y se acurruca con`, fallback: 'https://media.tenor.com/0pi4ZvdITz8AAAAC/anime-cuddle.gif' },
        feed: { text: `comparte su alimento con`, fallback: 'https://media.tenor.com/XqT2J0Yy5mMAAAAC/anime-feed.gif' },
        handhold: { text: `entrelaza sus manos con`, fallback: 'https://media.tenor.com/gZ2Z01lT1_QAAAAC/anime-holding-hands.gif' },
        highfive: { text: `choca los cinco en complicidad con`, fallback: 'https://media.tenor.com/uT_R64bJ-7cAAAAC/anime-high-five.gif' },
        hug: { text: `envuelve en un cálido abrazo a`, fallback: 'https://media.tenor.com/kCZjTqCKiggAAAAC/hug.gif' },
        kill: { text: `ha reclamado el alma de`, fallback: 'https://media.tenor.com/F_tYF1dFw0MAAAAC/anime-kill.gif' },
        kiss: { text: `ha sellado un beso con`, fallback: 'https://media.tenor.com/w1FUOof3jNwAAAAC/anime-kiss.gif' },
        lick: { text: `ha pasado su lengua sobre`, fallback: 'https://media.tenor.com/N6x1a71J_i0AAAAC/anime-lick.gif' },
        nom: { text: `ha dado un mordisco juguetón a`, fallback: 'https://media.tenor.com/L75I_fW0L6EAAAAC/anime-nom.gif' },
        pat: { text: `acaricia suavemente a`, fallback: 'https://media.tenor.com/N41zKIGX-UUAAAAC/anime-pat.gif' },
        poke: { text: `ha dado un toque de atención a`, fallback: 'https://media.tenor.com/qL-A0t2f6A8AAAAC/anime-poke.gif' },
        punch: { text: `ha asestado un golpe directo contra`, fallback: 'https://media.tenor.com/pZ_sI5I2lK4AAAAC/anime-punch.gif' },
        shoot: { text: `ha abierto fuego sin piedad contra`, fallback: 'https://media.tenor.com/Fw_L-l14ZcwAAAAC/anime-shoot.gif' },
        slap: { text: `ha cruzado el rostro de`, fallback: 'https://media.tenor.com/Vbg_XGntwS8AAAAC/anime-slap.gif' },
        spank: { text: `ha dado una palmada a`, fallback: 'https://media.tenor.com/7H-O7KxG-X8AAAAC/anime-spank.gif' },
        splash: { text: `ha empapado por completo a`, fallback: 'https://media.tenor.com/F7HkRcwRjEAAAAAC/anime-splash.gif' },
        spray: { text: `ha rociado sin compasión a`, fallback: 'https://media.tenor.com/D_ZtQyL4aUAAAAAC/anime-spray.gif' },
        stare: { text: `clava su mirada penetrante en`, fallback: 'https://media.tenor.com/0F9_bH_j_C0AAAAC/anime-stare.gif' },
        sue: { text: `ha iniciado un conflicto legal contra`, fallback: 'https://media.tenor.com/4oW7hZ11Pj0AAAAC/anime-objection.gif' },
        tickle: { text: `desata una ola de cosquillas sobre`, fallback: 'https://media.tenor.com/wG0X3-vj31gAAAAC/anime-tickle.gif' },
        yeet: { text: `ha mandado a volar lejos a`, fallback: 'https://media.tenor.com/F_L20I3f_24AAAAC/anime-yeet.gif' },
        paint: { text: `está pintando un hermoso retrato de`, fallback: 'https://media.tenor.com/e2oB6N0yJ3YAAAAC/anime-paint.gif' },
        glare: { text: `mira con desprecio y frialdad a`, fallback: 'https://media.tenor.com/a4gL0rD1zXMAAAAC/anime-glare.gif' },
        stomp: { text: `está pisoteando con mucha fuerza a`, fallback: 'https://media.tenor.com/cE0G-Fz10b4AAAAC/anime-stomp.gif' },
        sape: { text: `le ha dado un tremendo sape a`, fallback: 'https://media.tenor.com/x0R6sD3O8-EAAAAC/anime-smack.gif' },
        greet: { text: `le da una bienvenida formal a`, fallback: 'https://media.tenor.com/717M-j98H7AAAAAC/anime-wave.gif' }
    };

    const actionData = actions[normalizedType];
    if (!actionData) return { content: `╰┈➤ ❌ Acción \`${normalizedType}\` no reconocida por el sistema.`, ephemeral: true };

    // --- 🖼️ MOTOR DE BÚSQUEDA MULTI-NIVEL ---
    const folderPath = path.join(__dirname, '..', 'commands', normalizedType);
    let finalImageUrl = actionData.fallback;
    let finalAnimeName = 'Internet';
    let attachment = null;
    let safeFileName = 'action_image.gif';

    // Nivel 1: Archivos Locales (Tus carpetas personalizadas)
    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath).filter(file => file.match(/\.(gif|png|jpg)$/i));
            if (files.length > 0) {
                const selectedFile = files[Math.floor(Math.random() * files.length)];
                
                let rawName = selectedFile.split('_')[0];
                finalAnimeName = rawName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                const ext = path.extname(selectedFile);
                safeFileName = `action_image${ext}`;
                attachment = new AttachmentBuilder(path.join(folderPath, selectedFile), { name: safeFileName });
            }
        }
    } catch (error) { console.error(`❌ Error leyendo archivos locales en ${normalizedType}:`, error); }

    // Nivel 2: API Dinámica Aleatoria (nekos.best)
    if (!attachment) {
        try {
            // Acciones que soporta la API oficialmente
            const apiEndpoints = ['bite', 'cuddle', 'feed', 'handhold', 'highfive', 'hug', 'kiss', 'pat', 'poke', 'punch', 'shoot', 'slap', 'stare', 'tickle', 'yeet'];
            
            if (apiEndpoints.includes(normalizedType)) {
                const response = await fetch(`https://nekos.best/api/v2/${normalizedType}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        finalImageUrl = data.results[0].url; // GIF dinámico
                        finalAnimeName = data.results[0].anime_name; // Nombre real
                    }
                }
            }
        } catch (error) { 
            // Falla silenciosa, cae directo al Nivel 3 (Tenor)
        }
    }

    // --- 📄 CONSTRUCCIÓN DEL EMBED ROCKSTAR ---
    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${actionData.text} **${targetMember.displayName}** ${e2}`)
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

module.exports = { runAction };
