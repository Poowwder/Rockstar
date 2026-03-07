const fs = require('fs');
const path = require('path');
const marriageDataPath = path.join(__dirname, 'data', 'marriages.json');

// Almacenamiento en memoria para propuestas. Clave: targetId, Valor: proposerId
const proposals = new Map();

function getMarriages() {
    if (!fs.existsSync(marriageDataPath)) {
        fs.writeFileSync(marriageDataPath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(marriageDataPath, 'utf8'));
}

function saveMarriages(data) {
    fs.writeFileSync(marriageDataPath, JSON.stringify(data, null, 2));
}

function getPartnerId(guildId, userId) {
    const marriages = getMarriages();
    if (!marriages[guildId]) return null;
    return marriages[guildId][userId] || null;
}

function createMarriage(guildId, userId1, userId2) {
    const marriages = getMarriages();
    if (!marriages[guildId]) {
        marriages[guildId] = {};
    }
    marriages[guildId][userId1] = userId2;
    marriages[guildId][userId2] = userId1;
    saveMarriages(marriages);
}

function endMarriage(guildId, userId) {
    const marriages = getMarriages();
    if (!marriages[guildId]) return false;

    const partnerId = marriages[guildId][userId];
    if (!partnerId) return false;

    delete marriages[guildId][userId];
    delete marriages[guildId][partnerId];
    saveMarriages(marriages);
    return true;
}

function createProposal(proposerId, targetId) {
    if (proposals.has(targetId)) return false; // El objetivo ya tiene una propuesta
    proposals.set(targetId, proposerId);
    // Rechazar automáticamente después de 5 minutos
    setTimeout(() => {
        if (proposals.get(targetId) === proposerId) {
            proposals.delete(targetId);
        }
    }, 300000);
    return true;
}

function getOutgoingProposal(proposerId) {
    for (const [target, proposer] of proposals.entries()) {
        if (proposer === proposerId) return target;
    }
    return null;
}

module.exports = {
    getPartnerId,
    createMarriage,
    endMarriage,
    createProposal,
    hasProposedTo: (proposerId, targetId) => proposals.get(targetId) === proposerId,
    getProposal: (targetId) => proposals.get(targetId) || null,
    getOutgoingProposal,
    deleteProposal: (targetId) => proposals.delete(targetId)
};