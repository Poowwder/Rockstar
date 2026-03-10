const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'blush',
    description: 'Siente el rubor en tus mejillas 😊',
    category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'blush');
        await input.reply(result);
    }
};
