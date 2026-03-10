const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'smug', description: 'Presume un poco 😏', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'smug');
        await input.reply(result);
    }
};
