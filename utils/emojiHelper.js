const path = require('path');
const fs = require('fs');

// Intentamos detectar la raíz real del proyecto
const root = process.cwd(); 

// Lista de rutas posibles según tu estructura
const paths = [
    path.join(root, 'data', 'emojis.json'),             // Si está en el inicio (como dices)
    path.join(root, 'src', 'data', 'emojis.json'),      // Por si Render se confunde con la estructura
    path.resolve(__dirname, '../../data/emojis.json'),  // Relativo al archivo (subiendo niveles)
    path.resolve(__dirname, '../data/emojis.json')
];

let listaRaw = {};
let cargado = false;

for (const p of paths) {
    if (fs.existsSync(p)) {
        try {
            listaRaw = JSON.parse(fs.readFileSync(p, 'utf8'));
            console.log("✅ [EmojiHelper] ¡ENCONTRADO! Cargado desde: " + p);
            cargado = true;
            break;
        } catch (err) {
            console.error("❌ Error al leer el JSON encontrado:", err.message);
        }
    }
}

if (!cargado) {
    console.error("❌ [EmojiHelper] No se encontró el archivo en ninguna ruta.");
    // Fallback para evitar crasheos (puedes añadir tus IDs reales aquí)
    listaRaw = { pinkbow: '🎀', heart: '🤍' }; 
}

// Tu lógica de función para exportar
const valores = Object.values(listaRaw);
function helper() {
    return valores.length > 0 ? valores[Math.floor(Math.random() * valores.length)] : '✨';
}

for (const [key, value] of Object.entries(listaRaw)) {
    helper[key] = value;
}

module.exports = helper;