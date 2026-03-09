const path = require('path');
const fs = require('fs');

/**
 * Buscamos el archivo en la raíz del proyecto.
 * process.cwd() apunta a /opt/render/project/ (la raíz en Render)
 */
const jsonPath = path.join(process.cwd(), 'data', 'emojis.json');

let listaRaw = {};

try {
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ [EmojiHelper] Archivo cargado desde: " + jsonPath);
    } else {
        // Si no está ahí, intentamos una ruta relativa de emergencia
        const fallbackPath = path.resolve(__dirname, '../data/emojis.json');
        if (fs.existsSync(fallbackPath)) {
            listaRaw = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            console.log("✅ [EmojiHelper] Archivo cargado (Fallback): " + fallbackPath);
        } else {
            console.error("❌ [EmojiHelper] NO SE ENCONTRÓ EL ARCHIVO EN:");
            console.error("   1. " + jsonPath);
            console.error("   2. " + fallbackPath);
            // Valores por defecto para que el bot no crashee
            listaRaw = { pinkbow: '🎀', heart: '🌸', pinkstars: '✨', exclamation: '⚠️' };
        }
    }
} catch (e) {
    console.error("❌ [EmojiHelper] Error crítico:", e.message);
    listaRaw = { pinkbow: '🎀', heart: '🌸', pinkstars: '✨', exclamation: '⚠️' };
}

// Convertimos el objeto en una función con propiedades (tu sistema actual)
const valores = Object.values(listaRaw);
function helper() {
    return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨';
}

for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;