const path = require('path');
const fs = require('fs');

// 🚀 RUTA RELATIVA DIRECTA:
// __dirname es /utils. 
// '..' sube a la raíz del proyecto.
// 'data/emojis.json' entra a la carpeta.
const jsonPath = path.join(__dirname, '..', 'data', 'emojis.json');

let listaRaw = {};

try {
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ Emojis cargados con éxito desde: " + jsonPath);
    } else {
        // Si falla, imprimimos dónde lo buscó para saber qué pasa en Render
        console.error("❌ ERROR: El archivo NO existe en: " + jsonPath);
        listaRaw = { pinkbow: '🎀', whitebow: '⬅️', arrow: '➡️', heart: '❤️', star: '⭐', pinkstars: '✨', exclamation: '⚠️' };
    }
} catch (e) {
    console.error("❌ Error al procesar el JSON:", e.message);
    listaRaw = { pinkbow: '🎀', whitebow: '⬅️', arrow: '➡️', heart: '❤️', star: '⭐', pinkstars: '✨', exclamation: '⚠️' };
}

const valores = Object.values(listaRaw);
function helper() { return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨'; }

for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;