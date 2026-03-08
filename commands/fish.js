const { getUserData, updateUserData } = require('../economyManager.js');
const fishingZones = require('../data/fishing_zones.json');

module.exports = {
    name: 'fish',
    async execute(message) {
        const userId = message.author.id;
        let data = await getUserData(userId);

        // Lógica de pesca basada en tu JSON de zonas
        const pez = "Salmón Aesthetic"; // Aquí iría tu lógica de probabilidades
        const flores = 80;

        data.wallet += flores;
        
        // Guardar pez en inventario de Mongo
        const cantPez = data.inventory.get(pez) || 0;
        data.inventory.set(pez, cantPez + 1);

        await updateUserData(userId, data);

        message.reply(`🎣 ¡Pescaste un **${pez}**! +${flores} flores enviadas a tu cuenta. ✨`);
    }
};