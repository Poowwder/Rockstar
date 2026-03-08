const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'mine',
    async execute(message) {
        const userId = message.author.id;
        let data = await getUserData(userId);

        // Lógica de minería simple
        const minerales = ["Hierro", "Oro", "Diamante", "Piedra"];
        const recompensa = minerales[Math.floor(Math.random() * minerales.length)];
        const floresGanadas = Math.floor(Math.random() * 100) + 50;

        // Actualizar datos en MongoDB
        data.wallet += floresGanadas;
        
        // Guardar el mineral en el inventario (Map de MongoDB)
        const cantActual = data.inventory.get(recompensa) || 0;
        data.inventory.set(recompensa, cantActual + 1);

        await updateUserData(userId, data);

        message.reply(`⛏️ Has minado un **${recompensa}** y ganaste **${floresGanadas} flores** 🌸.`);
    }
};