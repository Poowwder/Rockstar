const mongoose = require('mongoose');

// 1. Definición del Esquema de Usuario (La estructura de tus datos)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    
    // Economía básica
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    
    // Sistema de Niveles
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    
    // Estadísticas para las Mascotas Coleccionables (Estilo Nekotina)
    messageCount: { type: Number, default: 0 },   // Para la mascota de 5k mensajes
    reactionCount: { type: Number, default: 0 },  // Para la mascota de 100 reacciones
    
    // Estatus Premium (none, mensual, bimestral)
    premiumType: { type: String, default: 'none' }, 
    
    // Inventario (Para guardar las mascotas desbloqueadas y otros items)
    // Usamos un Map para que sea fácil buscar: .has(), .get(), .set()
    inventory: { type: Map, of: Number, default: {} }
});

// 2. Creación del Modelo
const User = mongoose.model('User', userSchema);

/**
 * Obtiene los datos de un usuario. Si no existe, lo crea automáticamente.
 * @param {string} userId - ID de Discord del usuario
 */
async function getUserData(userId) {
    try {
        let user = await User.findOne({ userId });
        
        if (!user) {
            // Si el usuario es nuevo, lo creamos con los valores por defecto
            user = new User({ userId });
            await user.save();
            console.log(`✨ Nuevo usuario registrado en la base de datos: ${userId}`);
        }
        
        return user;
    } catch (e) {
        console.error("❌ Error al obtener datos de MongoDB:", e);
        // Retornamos un objeto básico para evitar que el bot crashee si falla la DB
        return { userId, wallet: 0, bank: 0, inventory: new Map(), messageCount: 0, reactionCount: 0, premiumType: 'none' };
    }
}

/**
 * Guarda los cambios realizados en los datos del usuario.
 * @param {string} userId - ID de Discord del usuario
 * @param {object} newData - Objeto con los datos actualizados
 */
async function updateUserData(userId, newData) {
    try {
        // Buscamos por ID y actualizamos con los nuevos datos
        // { upsert: true } crea el usuario si por alguna razón no existía
        // { new: true } devuelve el objeto ya actualizado
        return await User.findOneAndUpdate({ userId }, newData, { upsert: true, new: true });
    } catch (e) {
        console.error("❌ Error al guardar datos en MongoDB:", e);
    }
}

// 3. Exportación de funciones para usarlas en index.js y los comandos
module.exports = { 
    User, 
    getUserData, 
    updateUserData 
};