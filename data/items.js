// --- 💎 ITEMS FIJOS BASE (Vacíos por defecto) ---
// Esta lista se llenará SOLO con lo que tú pongas vía !!setitem
const ITEMS_FIJOS = [];

// --- 🎲 BOLSA DE ROTACIÓN (Aquí van las Vidas y el Anillo ahora) ---
const BOLSA_ROTATIVA = [
    { id: "vida", name: "Vida Extra 💖", price: 3500, emoji: "💖", tipo: "item" },
    { id: "anillo", name: "Anillo de Compromiso 💍", price: 15000, emoji: "💍", tipo: "item" },
    { id: "koko", name: "Insignia: Koko 🍓", price: 85000, emoji: "🍓", tipo: "badge" },
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

module.exports = { ITEMS_FIJOS, BOLSA_ROTATIVA };
