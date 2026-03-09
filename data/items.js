// --- 💎 TUS ITEMS FIJOS (Manuales) ---
const ITEMS_FIJOS = [
    { id: "vida", name: "Vida Extra 💖", price: 3500, emoji: "💖", tipo: "item" },
    { id: "anillo", name: "Anillo de Compromiso 💍", price: 15000, emoji: "💍", tipo: "item" },
    { id: "realeza", name: "Rol: Realeza VIP 👑", price: 150000, emoji: "👑", tipo: "rol", idRol: "ID_AQUÍ", premium: true }
];

// --- 🎲 BOLSA DE ROTACIÓN (Automáticos) ---
const BOLSA_ROTATIVA = [
    { id: "koko", name: "Insignia: Koko 🍓", price: 85000, emoji: "🍓", tipo: "badge" }, // <-- ¡Koko añadida! 🐾
    { id: "guitarra", name: "Guitarra de Cristal", price: 150000, emoji: "🎸" },
    { id: "camara", name: "Cámara Vintage", price: 45000, emoji: "📸" },
    { id: "perfume", name: "Perfume de Rosas", price: 12000, emoji: "🌹" },
    { id: "skate", name: "Skateboard Galáctico", price: 60000, emoji: "🛹" },
    { id: "oso", name: "Osito de Felpa Gigante", price: 25000, emoji: "🧸" },
    { id: "cafe", name: "Taza de Café Estético", price: 8000, emoji: "☕" },
    { id: "laptop", name: "Laptop Gamer Rosa", price: 95000, emoji: "💻" },
    { id: "auriculares", name: "Auriculares de Gato", price: 30000, emoji: "🎧" },
    { id: "vinilo", name: "Disco de Vinilo Rare", price: 55000, emoji: "💿" },
    { id: "mochila", name: "Mochila de Conejito", price: 18000, emoji: "🐰" },
    { id: "lentes", name: "Lentes de Corazón", price: 5000, emoji: "🕶️" },
    { id: "consola", name: "Consola Portátil", price: 75000, emoji: "🎮" }
];

// Lista completa para el sistema de reemplazo en shop.js
const ALL_ITEMS = [...ITEMS_FIJOS, ...BOLSA_ROTATIVA];

function getTiendaHoy() {
    const hoy = new Date();
    // La semilla cambia cada día
    const seed = hoy.getFullYear() + hoy.getMonth() + hoy.getDate();
    
    let rotados = [];
    let copia = [...BOLSA_ROTATIVA];
    
    // Sacamos 10 al azar usando la fecha como semilla
    for (let i = 0; i < 10; i++) {
        if (copia.length === 0) break;
        const index = (seed * (i + 1)) % copia.length;
        rotados.push(copia.splice(index, 1)[0]);
    }
    
    return [...ITEMS_FIJOS, ...rotados];
}

// Exportamos todo para que shop.js y buy.js tengan acceso total
module.exports = { getTiendaHoy, ALL_ITEMS, ITEMS_FIJOS, BOLSA_ROTATIVA };