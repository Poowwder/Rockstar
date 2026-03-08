const { getUserData } = require('./economyManager.js');

class MarriageManager {
    static async getMaxSlots(userId) {
        const data = await getUserData(userId);
        const type = data.premiumType?.toLowerCase() || 'normal';

        if (type === 'bimestral') return 20; // 💎 Elite
        if (type === 'mensual') return 15;   // 🎀 Premium
        return 10; // 🌸 Normal
    }

    static async getHarem(userId) {
        const data = await getUserData(userId);
        return data.harem || []; 
    }
}

module.exports = MarriageManager;