const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const economyDataPath = path.join(dataDir, 'economy.json');
const cooldownsPath = path.join(dataDir, 'cooldowns.json');
const auctionsPath = path.join(dataDir, 'auctions.json');

// --- Helper Functions ---
function readJSON(filePath, defaultValue = {}) {
    try {

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }

}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
}

const shopItems = () => {
    const p = path.join(__dirname, 'data', 'shop.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};
// --- User Data ---
function getUserData(userId) {
    const economyData = readJSON(economyDataPath);
    if (!economyData[userId]) {
        economyData[userId] = {
            wallet: 0,
            bank: 0,            
            inventory: [], // Ahora será un array de objetos: { id: 'item_id', quantity: 1 }

           dailyQuest: null,
            pet: null,
			job: 'unemployed',
            level: 1,
            experience: 0,
            activeBoosts: []
        };
    }

    return economyData[userId];
}


function applyLevelRewards(userId, oldLevel, newLevel) {
    let data = getUserData(userId);
    let rewardMoney = 0;

    for (let i = oldLevel + 1; i <= newLevel; i++) {
        rewardMoney += i * 100; // Ejemplo: recompensa base = nivel * 100

        if (i % 5 === 0) {
            // Recompensa especial cada 5 niveles
            addItemToInventory(userId, { id: 'rare_item', quantity: 1 });
        }
    }

    data.wallet += rewardMoney;
    updateUserData(userId, data);
    return rewardMoney;
}







function updateUserData(userId, data) {
    const economyData = readJSON(economyDataPath);
    economyData[userId] = data;
    writeJSON(economyDataPath, economyData);
}

// --- Inventory Management ---
function addItemToInventory(userId, item) { // item es un objeto { id: 'string', quantity: number }
    const data = getUserData(userId);
    const existingItem = data.inventory.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        data.inventory.push(item);
    }
    updateUserData(userId, data);
}

function decreaseDurability(userId, itemId, amount = 1) {
    const data = getUserData(userId);
    const item = data.inventory.find(i => i.id === itemId);
	 if (!item) return
    item.durability -= amount;
	 updateUserData(userId, data);

}
function hasActiveBoost(data, boostId) {
    return data.activeBoosts && data.activeBoosts.some(boost => boost.id === boostId && boost.expiresAt > Date.now());
}
""
function getBoostMultiplier(data, boostType) {
    let multiplier = 1;
    if (hasActiveBoost(data, 'boost_dinero_premium')) multiplier *= 5;
    if (hasActiveBoost(data, 'boost_exp_premium')) multiplier *= 5;
    if (hasActiveBoost(data, 'boost_suerte_premium')) multiplier *= 5;

    return multiplier;
}
""

function addMiningPickToInventory(userId, item) {
    const data = getUserData(userId);
    const existingItem = data.inventory.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        data.inventory.push({...item, durability: 100, maxDurability: 100});
    }
    updateUserData(userId, data);
}
function removeItemFromInventory(userId, itemId, quantity = 1) {
    const data = getUserData(userId);
    const itemIndex = data.inventory.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {

        const item = data.inventory[itemIndex];
        if (item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            data.inventory.splice(itemIndex, 1);
        }
        updateUserData(userId, data);
        return true; // Indicate success
    }
    return false; // Indicate item not found or not enough quantity
}

// Cooldown Management
const cooldowns = readJSON(cooldownsPath);

function checkAndSetCooldown(userId, command, durationSeconds) {
    const now = Date.now();
    const key = `${userId}-${command}`;
    
    const expirationTime = cooldowns[key] || 0;
    
    if (now < expirationTime) {
        return (expirationTime - now) / 1000; // Remaining time in seconds
    }
    
    cooldowns[key] = now + (durationSeconds * 1000);
    writeJSON(cooldownsPath, cooldowns);
    
    return 0; // No cooldown
}

function calculateLevel(exp) {
    return Math.floor(Math.sqrt(exp) / 10);
}

// --- Auction Management ---
function getAuctions() {
    return readJSON(auctionsPath);
}

function writeAuctions(data) {
    writeJSON(auctionsPath, data);
}

function createAuction(auctionData) {
    const auctions = getAuctions();
    const id = Date.now().toString(36); // Simple unique ID
    auctions[id] = { id, ...auctionData };
    writeAuctions(auctions);
    return id;
}

function placeBid(auctionId, userId, amount) {
    const auctions = getAuctions();
    if (!auctions[auctionId]) return false;

    const auction = auctions[auctionId];
    
    // Devolver el dinero al pujador anterior
    if (auction.lastBidder) {
        const bidderData = getUserData(auction.lastBidder);
        bidderData.wallet += auction.currentPrice;
        updateUserData(auction.lastBidder, bidderData);
    }

    auction.currentPrice = amount;
    auction.lastBidder = userId;
    writeAuctions(auctions);
    return true;
}




module.exports = {
    
    getUserData,
    updateUserData,
    addItemToInventory,
    removeItemFromInventory,
    checkAndSetCooldown,
    getAuctions,
    createAuction,
   placeBid,
   applyLevelRewards,
  shopItems,
 decreaseDurability,
   hasActiveBoost,
    getBoostMultiplier,
    equipMiningPick,



};

function equipMiningPick(userId, pickId) {
    // Implement the logic to equip a mining pick for a user
}

function getPets() { return }

