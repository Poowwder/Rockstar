const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'cringe', description: '¡Qué cringe! 😬', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'cringe');
        await input.reply(result);
    }
};
