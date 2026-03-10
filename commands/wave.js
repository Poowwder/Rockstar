const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'wave', description: 'Saluda con la mano 👋', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'wave');
        await input.reply(result);
    }
};
