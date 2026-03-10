const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'thinking', description: 'Estás pensando 🤔', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'thinking');
        await input.reply(result);
    }
};
