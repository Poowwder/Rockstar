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
// Nota: Cambié 'client' por 'input' (el message o interaction) para poder extraer el Guild y los Apodos.
async function runAction(input, type, targetUser) {
    const isSlash = !!input.user;
    const author = isSlash ? input.user : input.author;
    const guild = input.guild;

    // Obtenemos los apodos (Display Names) del servidor
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

    // --- 🖼️ MOTOR DE RUTAS Y ARCHIVOS LOCALES ---
    // Busca en la carpeta: /assets/actions/hug/ (o el tipo que sea)
    const folderPath = path.join(__dirname, '..', 'assets', 'actions', type);
    
    let selectedImage = null;
    let animeName = 'Desconocido';
    let attachment = null;

    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.gif') || file.endsWith('.png'));
            
            if (files.length > 0) {
                // Elegimos un archivo al azar
                selectedImage = files[Math.floor(Math.random() * files.length)];
                
                // Extraemos el nombre del Anime (Ej: "Naruto_01.gif" -> "Naruto")
                animeName = selectedImage.split('_')[0].replace(/-/g, ' ');

                // Preparamos el archivo para enviarlo a Discord
                attachment = new AttachmentBuilder(path.join(folderPath, selectedImage), { name: selectedImage });
            }
        }
    } catch (error) {
        console.error(`❌ Error leyendo la ruta de imágenes para ${type}:`, error);
    }

    // --- 📄 CONSTRUCCIÓN DEL EMBED ROCKSTAR ---
    const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setDescription(`> ${e1} **${authorMember.displayName}** ${actionText} **${targetMember.displayName}** ${e2}`)
        .setTimestamp() // Agrega la hora exacta abajo
        .setFooter({ 
            text: `Fuente: ${animeName} ⊹ Solicitado por ${authorMember.displayName}`,
            iconURL: author.displayAvatarURL({ dynamic: true })
        });

    // Si encontró una imagen local, la adjunta al embed
    let responseObj = { embeds: [embed] };

    if (attachment && selectedImage) {
        embed.setImage(`attachment://${selectedImage}`);
        responseObj.files = [attachment];
    } else {
        // Fallback por si la carpeta está vacía
        embed.setImage('https://i.pinimg.com/originals/c9/22/68/c92268d92cf2adc01fb14197940562dc.gif'); 
    }

    return responseObj;
}

module.exports = { runAction };
