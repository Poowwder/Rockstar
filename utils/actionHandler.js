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

    const authorMember = guild.members.cache.get(author.id) || { displayName: author.username };
    const targetMember = guild.members.cache.get(targetUser.id) || { displayName: targetUser.username };

    const e1 = getRndEmoji(guild);
    const e2 = getRndEmoji(guild);

    // --- 🛡️ AUTO-ACCIÓN ---
    if (author.id === targetUser.id) {
        return { 
            content: `╰┈➤ ${e1} Las sombras no permiten que dirijas esta acción hacia tu propia persona.`, 
            ephemeral: true 
        };
    }

    // --- 📜 DICCIONARIO NEUTRAL Y AESTHETIC ---
    const actions = {
        bite: `ha clavado sus colmillos en`,
        bully: `ha decidido atormentar a`,
        clap: `celebra con aplausos la presencia de`,
        cuddle: `comparte un momento íntimo y se acurruca con`,
        feed: `comparte su alimento con`,
        handhold: `entrelaza sus manos con`,
        highfive: `choca los cinco en complicidad con`,
        hug: `envuelve en un cálido abrazo a`,
        kill: `ha reclamado el alma de`,
        kiss: `ha sellado un beso con`,
        lick: `ha pasado su lengua sobre`,
        nom: `ha dado un mordisco juguetón a`,
        pat: `acaricia suavemente a`,
        poke: `ha dado un toque de atención a`,
        punch: `ha asestado un golpe directo contra`,
        shoot: `ha abierto fuego sin piedad contra`,
        slap: `ha cruzado el rostro de`,
        spank: `ha dado una palmada a`,
        splash: `ha empapado por completo a`,
        spray: `ha rociado sin compasión a`,
        stare: `clava su mirada penetrante en`,
        sue: `ha iniciado un conflicto legal contra`,
        tickle: `desata una ola de cosquillas sobre`,
        yeet: `ha mandado a volar lejos a`
    };

    const actionText = actions[type] || `interactúa misteriosamente con`;

    // --- 🖼️ MOTOR DE IMÁGENES SEGURO ---
    // Asegúrate de que tus carpetas de imágenes estén DENTRO de la carpeta 'commands' 
    // Ejemplo: /commands/hug/Naruto_1.gif
    const folderPath = path.join(__dirname, '..', 'commands', type.toLowerCase());
    
    let animeName = 'Desconocido';
    let attachment = null;
    let safeFileName = 'action_image.gif'; // Nombre seguro para Discord

    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.gif') || file.endsWith('.png') || file.endsWith('.jpg'));
            
            if (files.length > 0) {
                const selectedFile = files[Math.floor(Math.random() * files.length)];
                
                // Extrae el nombre del anime (Todo lo que esté antes del primer '_')
                let rawName = selectedFile.split('_')[0];
                // Limpia guiones y capitaliza la primera letra
                animeName = rawName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Extraemos la extensión real (.gif, .png, etc)
                const ext = path.extname(selectedFile);
                safeFileName = `action_image${ext}`;

                // Creamos el anexo con un nombre limpio y sin espacios para que Discord no llore
                attachment = new AttachmentBuilder(path.join(folderPath, selectedFile), { name: safeFileName });
            }
        } else {
            console.log(`⚠️ La carpeta para la acción "${type}" no existe en: ${folderPath}`);
        }
    } catch (error) {
        console.error(`❌ Error procesando imagen para ${type}:`, error);
    }

    // --- 📄 CONSTRUCCIÓN DEL EMBED ROCKSTAR ---
    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${actionText} **${targetMember.displayName}** ${e2}`)
        .setTimestamp() 
        .setFooter({ 
            text: `Anime: ${animeName} ⊹ Solicitado por ${authorMember.displayName}`,
            iconURL: author.displayAvatarURL({ dynamic: true })
        });

    let responseObj = { embeds: [embed] };

    // Si encontramos una imagen local, la adjuntamos de forma segura
    if (attachment) {
        embed.setImage(`attachment://${safeFileName}`);
        responseObj.files = [attachment];
    } else {
        // Fallback si la carpeta no existe o está vacía
        embed.setImage('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif'); 
    }

    return responseObj;
}

module.exports = { runAction };
