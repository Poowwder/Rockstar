const path = require('path');
const fs = require('fs');

// --- 📂 RUTA A TU CARPETA DATA ---
const jsonPath = path.join(__dirname, '../data/emojis.json');

let listaRaw = {};

try {
    if (fs.existsSync(jsonPath)) {
        const contenido = fs.readFileSync(jsonPath, 'utf8');
        listaRaw = JSON.parse(contenido);
        console.log("✅ Emojis personalizados cargados desde data/emojis.json");
    } else {
        console.warn("⚠️ No se encontró data/emojis.json");
    }
} catch (e) {
    console.error("❌ Error en el JSON de emojis:", e.message);
}

const valores = Object.values(listaRaw);

// Función de azar (usa tus emojis del JSON)
function emojisAzar() {
    return valores.length > 0 
        ? valores[Math.floor(Math.random() * valores.length)] 
        : '✨'; // Respaldo si el JSON está vacío
}

// Creamos un objeto que es al mismo tiempo una función
const helper = (...args) => emojisAzar(...args);

// Mapeamos tus emojis (pinkbow, whitebow, etc)
for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;