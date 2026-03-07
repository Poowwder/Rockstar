const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'economy.db');
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

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    userId TEXT PRIMARY KEY,
                    wallet INTEGER DEFAULT 0,
                    bank INTEGER DEFAULT 0,
                    inventory TEXT DEFAULT '[]',
                    dailyQuest TEXT,
                    pet TEXT,
                    job TEXT DEFAULT 'unemployed',
                    level INTEGER DEFAULT 1,
					equippedFishingRod TEXT,
                    experience INTEGER DEFAULT 0,
                    activeBoosts TEXT DEFAULT '[]'
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS cooldowns (
                    userId TEXT,
                    command TEXT,
                    timestamp INTEGER,
                    PRIMARY KEY (userId, command)
                )
            `);

          
        });
    }
});




// --- User Data ---
function getUserData(userId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE userId = ?", [userId], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            }
            if (!row) {
                const defaultData = {
            wallet: 0,
            bank: 0,            
            inventory: [], // Ahora será un array de objetos: { id: 'item_id', quantity: 1 }

           dailyQuest: null,
            pet: null,
			job: 'unemployed',
			equippedFishingRod: null,
	hasPremium: false,
            level: 1,	
            experience: 0,
            activeBoosts: []
        };

                db.run(
                    "INSERT INTO users (userId, wallet, bank, inventory, dailyQuest, pet, job, level, experience, activeBoosts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [userId, defaultData.wallet, defaultData.bank, JSON.stringify(defaultData.inventory), defaultData.dailyQuest, defaultData.pet, defaultData.job, defaultData.level,defaultData.equippedFishingRod, defaultData.experience, JSON.stringify(defaultData.activeBoosts)],
                    (err) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                            return;
                        }
                        resolve(defaultData);
                    }
                );
            } else {
                resolve({
                    userId: row.userId,
                    wallet: row.wallet,
                    bank: row.bank,
                    inventory: JSON.parse(row.inventory),
                    dailyQuest: row.dailyQuest,
                    pet: row.pet,
                    job: row.job,
                    level: row.level,
					equippedFishingRod: row.equippedFishingRod,
                    experience: row.experience,
                    activeBoosts: JSON.parse(row.activeBoosts)
                });
            }
        });
    });
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





async function updateUserData(userId, data) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET wallet = ?, bank = ?, inventory = ?, dailyQuest = ?, pet = ?, job = ?, level = ?,equippedFishingRod = ?, experience = ?, activeBoosts = ? WHERE userId = ?`,
            [data.wallet, data.bank, JSON.stringify(data.inventory), data.dailyQuest, data.pet, data.job, data.level, data.experience, JSON.stringify(data.activeBoosts), userId],
            (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve();
            }
        );
    });
}


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

const shopItems = () => {
    const p = path.join(__dirname, 'data', 'shop.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

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
    decreaseResource,
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
