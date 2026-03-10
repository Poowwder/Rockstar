const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'pout', description: 'Haz un puchero 😤', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'pout');
        await input.reply(result);
    }
};
