// --- 💎 ITEMS FIJOS BASE ---
// Estos se mantienen vacíos para que tú los gestiones con !!setitem o !!additem
const ITEMS_FIJOS = [];

// --- 🎲 BOLSA DE ROTACIÓN (Mezcla de Estética + Progresión Hardcore) ---
const BOLSA_ROTATIVA = [
    // --- 🌸 TUS ÍTEMS ESTÉTICOS ORIGINALES ---
    { id: "vida", name: "Vida Extra 💖", price: 3500, emoji: "💖", tipo: "rotativo" },
    { id: "anillo", name: "Anillo de Compromiso 💍", price: 15000, emoji: "💍", tipo: "rotativo" },
    { id: "guitarra", name: "Guitarra de Cristal", price: 150000, emoji: "🎸", tipo: "rotativo" },
    { id: "camara", name: "Cámara Vintage", price: 45000, emoji: "📸", tipo: "rotativo" },
    { id: "perfume", name: "Perfume de Rosas", price: 12000, emoji: "🌹", tipo: "rotativo" },
    { id: "skate", name: "Skateboard Galáctico", price: 60000, emoji: "🛹", tipo: "rotativo" },
    { id: "oso", name: "Osito de Felpa Gigante", price: 25000, emoji: "🧸", tipo: "rotativo" },
    { id: "cafe", name: "Taza de Café Estético", price: 8000, emoji: "☕", tipo: "rotativo" },
    { id: 'laptop', name: 'Laptop Gamer Rosa', price: 95000, emoji: '💻', tipo: 'rotativo' },
    { id: 'auriculares', name: 'Auriculares de Gato', price: 30000, emoji: '🎧', tipo: 'rotativo' },
    { id: 'vinilo', name: 'Disco de Vinilo Rare', price: 55000, emoji: '💿', tipo: 'rotativo' },
    { id: 'mochila', name: 'Mochila de Conejito', price: 18000, emoji: '🐰', tipo: 'rotativo' },
    { id: 'lentes', name: 'Lentes de Corazón', price: 5000, emoji: '🕶️', tipo: 'rotativo' },
    { id: 'consola', name: 'Consola Portátil', price: 75000, emoji: '🎮', tipo: 'rotativo' },

    // --- ⛓️ MATERIALES DE PROGRESIÓN (Aparecen rara vez) ---
    { id: "hierro_bruto", name: "Lote de Hierro Bruto", price: 12000, emoji: "⛓️", tipo: "rotativo" },
    { id: "cristal_profundo", name: "Cristal Profundo", price: 25000, emoji: "💎", tipo: "rotativo" },
    { id: "gema_mitica", name: "Gema Mítica", price: 45000, emoji: "🔮", tipo: "rotativo" },
    { id: "fragmento_void", name: "Fragmento del Vacío", price: 60000, emoji: "🌌", tipo: "rotativo" },
    { id: "esencia_sombra", name: "Esencia de Sombra", price: 90000, emoji: "🌑", tipo: "rotativo", premium: true },
    { id: "materia_oscura", name: "Materia Oscura", price: 250000, emoji: "🌌", tipo: "rotativo", premium: true },

    // --- 🚀 BOOSTS Y RAROS ---
    { id: 'boost_flores', name: 'Multiplicador x2 (Boost)', price: 20000, emoji: '🚀', tipo: 'rotativo' },
    { id: 'diamante_rosa', name: 'Diamante Rosa', price: 40000, emoji: '✨', tipo: 'rotativo' },

    // --- 🏆 RELIQUIAS TERMINADAS (Dificilísimas de ver) ---
    { id: "pico_mitico", name: "Pico: Eclipse Eterno", price: 350000, emoji: "⛏️", tipo: "rotativo", premium: true },
    { id: "cana_divina", name: "Caña: Lágrima de Neptuno", price: 350000, emoji: "🎣", tipo: "rotativo", premium: true },
    { id: "pico_void", name: "Pico: Void Haven", price: 500000, emoji: "🌌", tipo: "rotativo", premium: true },
    { id: "cana_void", name: "Caña: Abyss of Stars", price: 500000, emoji: "🌌", tipo: "rotativo", premium: true }
];

module.exports = { ITEMS_FIJOS, BOLSA_ROTATIVA };
