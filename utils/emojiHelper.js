const path = require('path');
const fs = require('fs');

// 🚀 ESTA RUTA ES DEFINITIVA PARA TU ESTRUCTURA:
// process.cwd() nos lleva a la carpeta principal (ROCKSTAR)
// Luego entramos directo a data/emojis.json
const jsonPath = path.join(process.cwd(), 'data', 'emojis.json');

let listaRaw = {};

try {
    // Verificamos si el archivo existe en la ruta que vimos en tu captura
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ Emojis cargados con éxito desde: " + jsonPath);
    } else {
        console.warn("⚠️ No se encontró el archivo en la raíz. Intentando ruta alterna...");
        
        // Intento de respaldo por si Render se pone caprichoso
        const backupPath = path.join(__dirname, '..', 'data', 'emojis.json');
        if (fs.existsSync(backupPath)) {
            listaRaw = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            console.log("✅ Emojis cargados desde ruta de respaldo.");
        } else {
            console.error("❌ ERROR: No se encontró emojis.json en ninguna parte.");
            listaRaw = { pinkbow: '🎀', whitebow: '⬅️', arrow: '➡️', heart: '❤️', star: '⭐', pinkstars: '✨', exclamation: '⚠️' };
        }
    }
} catch (e) {
    console.error("❌ Error al procesar el JSON:", e.message);
    listaRaw = { pinkbow: '🎀', whitebow: '⬅️', arrow: '➡️', heart: '❤️', star: '⭐', pinkstars: '✨', exclamation: '⚠️' };
}

const valores = Object.values(listaRaw);

function helper() {
    return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨';
}

for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;