const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'wink', description: 'Guiña un ojo 😉', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'wink');
        await input.reply(result);
    }
};
