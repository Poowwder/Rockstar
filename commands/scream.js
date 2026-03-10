const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'scream', description: '¡Grita fuerte! 😫', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'scream');
        await input.reply(result);
    }
};
