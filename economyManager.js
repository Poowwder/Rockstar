const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, './data/economy.db'));

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS economy (
    userId TEXT PRIMARY KEY,
    data TEXT
)`);

const getUserData = (userId) => {
    return new Promise((resolve) => {
        db.get("SELECT data FROM economy WHERE userId = ?", [userId], (err, row) => {
            if (row) resolve(JSON.parse(row.data));
            else resolve({ wallet: 0, bank: 0, inventory: {}, level: 1, xp: 0, job: null });
        });
    });
};

const updateUserData = (userId, data) => {
    return new Promise((resolve) => {
        db.run("INSERT OR REPLACE INTO economy (userId, data) VALUES (?, ?)", [userId, JSON.stringify(data)], () => {
            resolve();
        });
    });
};

const getAllData = () => {
    return new Promise((resolve) => {
        db.all("SELECT userId, data FROM economy", [], (err, rows) => {
            if (err) resolve([]);
            resolve(rows.map(r => ({ userId: r.userId, ...JSON.parse(r.data) })));
        });
    });
};

module.exports = { getUserData, updateUserData, getAllData };