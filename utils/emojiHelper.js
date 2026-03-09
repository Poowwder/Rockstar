const path = require('path');
const fs = require('fs');

// 🚀 RUTA CORRECTA:
// __dirname es /utils
// '..' sube a la raíz (ROCKSTAR)
// 'data/emojis.json' entra a la carpeta que vemos en tu captura
const jsonPath = path.join(__dirname, '..', 'data', 'emojis.json');

let listaRaw = {};

try {
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ Emojis cargados correctamente desde ROCKSTAR/data/emojis.json");
    } else {
        console.warn("⚠️ No se encontró el archivo en: " + jsonPath);
        // Respaldo por si el archivo no se sube bien
        listaRaw = { pinkbow: '🎀', whitebow: '⬅️', arrow: '➡️', heart: '❤️' };
    }
} catch (e) {
    console.error("❌ Error al leer el JSON:", e.message);
}

const valores = Object.values(listaRaw);

// Función de azar
function helper() {
    return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨';
}

// Mapear los nombres (pinkbow, arrow, etc.)
for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;