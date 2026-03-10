const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'bye', description: 'Dí adiós 👋', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'bye');
        await input.reply(result);
    }
};
