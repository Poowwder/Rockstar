const { getUserData } = require('./economyManager.js');

class MarriageManager {
    static async isMarried(userId) {
        const data = await getUserData(userId);
        return !!data.marry; // Devuelve true si tiene ID de pareja
    }

    static async getPartner(userId) {
        const data = await getUserData(userId);
        return data.marry || null;
    }

    static async hasPendingRequest(userId) {
        const data = await getUserData(userId);
        return data.pendingMarriage || null;
    }
}

module.exports = MarriageManager;