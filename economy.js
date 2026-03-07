const fs = require('fs');
const path = require('path');
const economyDataPath = path.join(__dirname, 'economy.json');

// Estructura de datos de usuario por defecto
const defaultUserData = {
    wallet: 0,
    bank: 0,
    inventory: [],
    cooldowns: {}
};

// Obtener todos los datos de economía
function getEconomyData() {
    if (!fs.existsSync(economyDataPath)) {
        fs.writeFileSync(economyDataPath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(economyDataPath, 'utf8'));
}

// Guardar todos los datos de economía
function saveEconomyData(data) {
    fs.writeFileSync(economyDataPath, JSON.stringify(data, null, 2));
}

// Obtener los datos de un usuario específico
function getUserData(userId) {
    const data = getEconomyData();
    if (!data[userId]) {
        data[userId] = JSON.parse(JSON.stringify(defaultUserData)); // Deep copy
        saveEconomyData(data);
    }
    // Asegura que los usuarios antiguos tengan todas las claves por defecto
    return { ...JSON.parse(JSON.stringify(defaultUserData)), ...data[userId] };
}

// Actualizar los datos de un usuario
function updateUserData(userId, newData) {
    const data = getEconomyData();
    data[userId] = newData;
    saveEconomyData(data);
}

// Comprobar y establecer cooldowns
function checkAndSetCooldown(userId, command, durationSeconds) {
    const userData = getUserData(userId);
    const now = Date.now();
    const cooldownEnd = userData.cooldowns[command] || 0;

    if (now < cooldownEnd) {
        return (cooldownEnd - now) / 1000; // Devuelve los segundos restantes
    }

    userData.cooldowns[command] = now + (durationSeconds * 1000);
    updateUserData(userId, userData);
    return 0; // Cooldown exitosamente establecido
}

// Añadir un item al inventario del usuario
function addItemToInventory(userId, itemId, quantity = 1) {
    const userData = getUserData(userId);
    const itemIndex = userData.inventory.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        userData.inventory[itemIndex].quantity += quantity;
    } else {
        userData.inventory.push({ id: itemId, quantity });
    }
    updateUserData(userId, userData);
}

// Quitar un item del inventario del usuario
function removeItemFromInventory(userId, itemId, quantity = 1) {
    const userData = getUserData(userId);
    const itemIndex = userData.inventory.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        userData.inventory[itemIndex].quantity -= quantity;
        if (userData.inventory[itemIndex].quantity <= 0) {
            userData.inventory.splice(itemIndex, 1);
        }
        updateUserData(userId, userData);
        return true; // Success
    }
    return false; // Item not found
}

module.exports = {
    getUserData,
    updateUserData,
    checkAndSetCooldown,
    getEconomyData,
    addItemToInventory,
    removeItemFromInventory
};