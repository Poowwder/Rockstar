const listaRaw = require('../emojis.json');
const valores = Object.values(listaRaw);

// Esta función es la que hace la magia
function emojis() {
    return valores[Math.floor(Math.random() * valores.length)];
}

// También le pegamos los emojis fijos por si quieres usar uno exacto
for (const [key, value] of Object.entries(listaRaw)) {
    emojis[key] = value;
}

module.exports = emojis;