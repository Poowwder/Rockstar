const path = require('path');
const fs = require('fs');

// Al no haber src, la raíz es donde está tu index.js
const raiz = process.cwd(); 
const jsonPath = path.join(raiz, 'data', 'emojis.json');

let listaRaw = {};

try {
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ [EmojiHelper] Archivo cargado correctamente desde la raíz: " + jsonPath);
    } else {
        console.error("❌ [EmojiHelper] ¡EL ARCHIVO NO ESTÁ!");
        console.error("Ruta intentada: " + jsonPath);
        
        // Esto te dirá qué carpetas VE el bot realmente en la raíz
        console.log("Carpetas encontradas en el inicio:", fs.readdirSync(raiz));
        
        listaRaw = { pinkbow: '🎀', heart: '🌸' }; 
    }
} catch (e) {
    console.error("❌ [EmojiHelper] Error al leer el JSON:", e.message);
    listaRaw = { pinkbow: '🎀', heart: '🌸' };
}

const valores = Object.values(listaRaw);
function helper() {
    return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨';
}

for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;