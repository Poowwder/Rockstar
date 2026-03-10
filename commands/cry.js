const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'cry',
    description: 'Derrama lágrimas en silencio 😭',
    category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'cry');
        await input.reply(result);
    }
};
